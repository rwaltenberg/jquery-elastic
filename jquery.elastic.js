/**
*	@name							Elastic
*	@descripton						Elastic is Jquery plugin that grow and shrink your textareas automaticliy
*	@version						1.6.3
*	@requires						Jquery 1.2.6+
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licens							MIT License - http://www.opensource.org/licenses/mit-license.php
*/

/* global jQuery */
(function(jQuery){ 
	//	We will create a div clone of the textarea
	//	by copying these attributes from the textarea to the div.
	var mimics = 'borderTop borderRight borderBottom borderLeft paddingTop paddingRight paddingBottom paddingLeft fontSize lineHeight fontFamily width fontWeight'.split(' ');

	function pseudoUUID(p) {
		p = p || '';
		var u = function() { return(((1+Math.random())*0x10000)|0).toString(16).substring(1); }
		return(p+u()+u()+"-"+u()+"-"+u()+"-"+u()+"-"+u()+u()+u());
	};

	jQuery.fn.extend({
		elastic: function() {
			return this.each( function() {
				// Elastic only works on textareas
				if(this.type != 'textarea') {
					return false;
				}
				
				var $textarea	=	jQuery(this),
					$twin		=	null,
					twinId		=	$textarea.data('elastic-twin');
					
				if(twinId) {
					$twin		=	jQuery('#'+twinId);
					update();
					return false;
				}
				
				twinId			=	pseudoUUID('elastic');
				$twin			=	jQuery('<div />').css({'position': 'absolute','display':'block','word-wrap':'break-word', 'box-sizing': 'content-box'});
				$twin.attr('id',twinId);
				$textarea.data('elastic-twin',twinId);
					
				var	lineHeight	=	parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
					minheight	=	parseInt($textarea.css('height'),10) || lineHeight*3,
					maxheight	=	parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
					goalheight	=	0;
				
				
				// Opera returns max-height of -1 if not set
				if (maxheight < 0) { maxheight = Number.MAX_VALUE; }
					
				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());
				
				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow){
					var curratedHeight = Math.floor(parseInt(height,10));
					if($textarea.height() != curratedHeight){
						$textarea.css({'height': curratedHeight + 'px','overflow':overflow});
						// Also change the twin's overflow so when max-height is reached, adding the scrollbars won't add height to the textarea
						$twin.css('overflow',overflow);
					}
				}
				
				// This function will update the height of the textarea if necessary 
				function update() {
					// Copy the essential styles (mimics) from the textarea to the twin
					var i = mimics.length;
					while(i--){
						$twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
					}
					
					// Get curated content from the textarea.
					var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/  /g, ' &nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
					
					// Compare curated content with curated twin.
					var twinContent = $twin.html().replace(/<br>/ig,'<br />');
					
					if((textareaContent+'&nbsp;' != twinContent) || ($textarea.width() != $twin.width())){
						// Set twin to the same width as the textarea
						$twin.width($textarea.width());
						
						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent+'&nbsp;');
						
						var gap = parseInt($twin.css('padding-top'),10) + 
								  parseInt($twin.css('border-top-width'),10) +
								  parseInt($twin.css('padding-bottom'),10) +
								  parseInt($twin.css('border-bottom-width'),10);
								  
						var goalheight = $twin.height() + ($textarea.css('box-sizing') === 'border-box' ? gap : 0);
						
						if(goalheight >= maxheight) {
							setHeightAndOverflow(maxheight,'auto');
						} else if(goalheight <= minheight) {
							setHeightAndOverflow(minheight,'hidden');
						} else {
							setHeightAndOverflow(goalheight,'hidden');
						}
					}
				}
				
				// Hide scrollbars
				$textarea.css({'overflow':'hidden'});
				
				function updateClosure() {
					update();
				};

				// Update textarea size on keyup
				$textarea.keyup(updateClosure);
				
				// Define a custom event to allow manual updating
				$textarea.bind('elasticupdate', updateClosure);
				
				// And this line is to catch the browser paste event
				$textarea.live('input paste',function() { setTimeout(updateClosure, 250); });
				
				// Run update once when elastic is initialized
				update();
			});
		}
	});
})(jQuery);
