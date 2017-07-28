var TWO = {
  renderers: []
};

requestFrame = ( window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function( callback ) {
		window.setTimeout(callback, 1000 / 60);
	}
);

TWO.gamepad = function() {
	var gamepads = navigator.getGamepads();
	for( var i = 0; i < gamepads.length; i++ ) {
		if( gamepads[ i ] !== undefined )
		return gamepads[ i ];
	}
	return null;
}

TWO.gamepadControl = function() {
	var gamepad = {
		buttons: [],
		axes: []
	};
	for( var i = 0; i < 16; i++ )
		gamepad.buttons.push( {
			pressed: false
		} );
	return gamepad;
}

TWO.mouse = function( renderer ) {
	var mouse = new TWO.Vector2( undefined, undefined );
	mouse.renderer = renderer || undefined;
	mouse.clicking = false;
	window.addEventListener( "mousemove", function( event ) {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
		if( mouse.renderer !== undefined ) {
			mouse.x = ( mouse.x - mouse.renderer.c.width / 2 - mouse.renderer.left ) * mouse.renderer.ratio;
			mouse.y = ( mouse.y - mouse.renderer.c.height / 2 - mouse.renderer.top ) * mouse.renderer.ratio;
		}
	} );
	window.addEventListener( "mousedown", function( event ) {
		mouse.clicking = true;
	} );
	window.addEventListener( "mouseup", function( event ) {
		mouse.clicking = false;
	} );
	mouse.fromRenderer = function( renderer ) {
		this.x = ( this.x - renderer.c.width / 2 - renderer.left ) * renderer.ratio / 2;
		this.y = ( this.y - renderer.c.height / 2 - renderer.top ) * renderer.ratio / 2;
	}
	mouse.isCollidingWithRectangle = function( rectangle ) {
		if( renderer === undefined )
			return false;
		if( this.x < rectangle.position.x + rectangle.width / 2 &&
			this.x > rectangle.position.x - rectangle.width / 2 &&
			this.y < rectangle.position.y + rectangle.height / 2 &&
			this.y > rectangle.position.y - rectangle.height / 2 )
			return true;
		return false;
	}
	return mouse;
};

TWO.menu = function( mouse ) {
	return {
		objects: [],
		mouse: mouse,
		type: "menu",
		tweenPosition: new TWO.Vector2( 0, 0 ),
		tweenOpacity: 0,
		tweening: false,
		tweenPercent: 0.02,
		tweenSize: 0,
		enabled: true,
		size: 1,
		moveObjects: function( vec2 ) {
			this.objects.forEach( function( object ) {
				object.position.x += vec2.x;
				object.position.y += vec2.y;
			} );
		},
		add: function( object ) {
			this.objects.push( object );
			object.normalOpacity = object.opacity;
			for( var i = 0; i < object.objects.length; i++ ) {
				object.objects[ i ].normalOpacity = object.objects[ i ].opacity;
			}
			if( object.type == "rectangle" ) {
				object.hovering = false;
				object.onClick = function() {};
			}
		},
		remove: function( object ) {
			if( this.objects.indexOf( object ) != -1 )
				this.objects.splice( this.objects.indexOf( object ), 1 );
		},
		render: function( ctx, ratio ) {
			for( var i = 0; i < this.objects.length; i++ ) {
				var object = this.objects[ i ];
				if( object.type == "rectangle" && this.enabled ) {
					if( mouse.isCollidingWithRectangle( object ) ) {
						if( mouse.clicking )
							object.onClick();
						object.hovering = true;
					}
					else
						object.hovering = false;
				}
				if( this.tweening ) {
					if( Math.abs( this.tweenPosition.x - object.position.x ) < 5 )
						this.tweening = false;
					object.position.x += ( this.tweenPosition.x - object.position.x ) * this.tweenPercent;
					//object.size += ( this.tweenSize - object.size ) * this.tweenPercent;
					//object.position.y += ( this.tweenPosition.y - object.position.y ) * this.tweenPercent;
					object.opacity += ( this.tweenOpacity * object.normalOpacity - object.opacity ) * this.tweenPercent;
					for( var j = 0; j < object.objects.length; j++ ) {
						object.objects[j].opacity += ( this.tweenOpacity * object.objects[j].normalOpacity - object.objects[j].opacity ) * this.tweenPercent;
					}
				}
				object.render( ctx, ratio * this.size );
			}
		}
	};
}

TWO.touch = function() {
	var touches = [];
	window.addEventListener( "touchmove", function( event ) {
		event.preventDefault();
		while( event.targetTouches.length > touches.length )
			touches.push( new TWO.Vector2( 0, 0 ) );
		while( event.targetTouches.length < touches.length )
			touches.splice( 0, 1 );
		for( var i = 0; i < event.targetTouches.length; i++ ) {
			touches[i].x = event.targetTouches[i].pageX;
			touches[i].y = event.targetTouches[i].pageY;
		}
	} );
	window.addEventListener( "touchend", function( event ) {
		while( event.targetTouches.length < touches.length )
			touches.splice( 0, 1 );
	} );
	window.addEventListener( "touchstart", function( event ) {
		event.preventDefault();
		while( event.targetTouches.length > touches.length )
			touches.push( new TWO.Vector2( 0, 0 ) );
		for( var i = 0; i < event.targetTouches.length; i++ ) {
			touches[i].x = event.targetTouches[i].pageX;
			touches[i].y = event.targetTouches[i].pageY;
		}
	} );
	return touches;
}

TWO.renderer = function( canvas ) {
  TWO.renderers.push( {
    ctx: canvas.getContext( '2d' ),
    c: canvas,
		clearScreen: true,
		top: 0,
		left: 0,
		leftOfScreen: 0,
		rightOfScreen: 0,
		topOfScreen: 0,
		bottomOfScreen: 0,
    position: new TWO.Vector2( 0, 0 ),
    ratio: 1,
    render: function( scene ) {
      this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
			if( this.clearScreen )
	      this.clear();
      this.ctx.translate( -this.position.x / this.ratio + this.c.width / 2, -this.position.y / this.ratio + this.c.height / 2 );
      scene.render( this.ctx, this.ratio * scene.camera.ratio );
    },
		clear: function() {
			this.ctx.setTransform( 1, 0, 0, 1, 0, 0 );
			this.ctx.clearRect( 0, 0, this.c.width, this.c.height );
		}
  } );
	TWO.resize();
  return TWO.renderers[ TWO.renderers.length - 1 ];
};

TWO.socket = function( ip, onmessage, onopen, onclose, onerror ) {
	if ( ip === undefined )
		return null;
	var socket = new WebSocket( ip );
	socket.onmessage = onmessage || function() {};
	socket.onopen = onopen || function() {};
	socket.onclose = onclose || function() {};
	socket.onerror = onerror || function() {};
	return socket;
};

TWO.resize = function() {
	var renderSize = 1;
  TWO.renderers.forEach( function( renderer ) {
    if ( document.body.clientWidth / renderer.c.width <= document.body.clientHeight / renderer.c.height ) {
      renderer.c.height = document.body.clientHeight;
      renderer.c.width = renderer.c.height * 16 / 9;
      renderer.ratio = 1080 / renderer.c.height;
      renderer.c.style.height = "100%";
      renderer.c.style.width = document.body.clientHeight / renderer.c.height * renderer.c.width + 2;
      renderer.c.style.top = "0";
			renderer.top = 0;
      renderer.c.style.left = document.body.clientWidth / 2 - (document.body.clientHeight / renderer.c.height * renderer.c.width) / 2 - 1 + "px";
			renderer.left = document.body.clientWidth / 2 - (document.body.clientHeight / renderer.c.height * renderer.c.width) / 2 - 1;
    } else {
      renderer.c.width = document.body.clientWidth;
	  renderer.c.height = renderer.c.width * 9 / 16;
      renderer.ratio = 1920 / renderer.c.width;
      renderer.c.style.width = "100%";
      renderer.c.style.height = document.body.clientWidth / renderer.c.width * renderer.c.height;
      renderer.c.style.left = "0";
			renderer.left = 0;
      renderer.c.style.top = document.body.clientHeight / 2 - (document.body.clientWidth / renderer.c.width * renderer.c.height) / 2 + "px";
			renderer.top = document.body.clientHeight / 2 - (document.body.clientWidth / renderer.c.width * renderer.c.height) / 2;
    }
		renderer.leftOfScreen = -1920 / 2 - ( (document.body.clientWidth - renderer.c.width) / 2 * renderer.ratio);
		renderer.topOfScreen = -1080 / 2 - ( (document.body.clientHeight - renderer.c.height) / 2 * renderer.ratio);
		renderer.rightOfScreen = -renderer.leftOfScreen;
		renderer.bottomOfScreen = -renderer.topOfScreen;
		renderer.c.width /= renderSize;
		renderer.c.height /= renderSize;
		renderer.ratio *= renderSize;
  } );
};

window.addEventListener( 'resize', TWO.resize, false );

TWO.image = function( image, x, y, width, height ) {
  image = image || null;
  x = x || 0;
  y = y || 0;
  width = width || 100;
  height = height || 100;
  return {
    width: width,
    height: height,
    image: image,
		size: 1,
		opacity: 1,
		rotation: 0,
    position: new TWO.Vector2( x, y ),
    type: "image",
		objects: [],
		add: function( object ) {
			this.objects.push( object );
		},
		remove: function( object ) {
			if( this.objects.indexOf( object ) != -1 )
				this.objects.splice( this.objects.indexOf( object ), 1 );
		},
		render: function( ctx, ratio ) {
			ctx.globalAlpha = this.opacity;
			ctx.translate( this.position.x / ratio, this.position.y / ratio );
			ctx.rotate( this.rotation );
      ctx.drawImage( this.image, -this.width * this.size / 2 / ratio, -this.height * this.size / 2 / ratio, this.width * this.size / ratio, this.height * this.size / ratio );
			this.objects.forEach( function( object ) {
				object.render( ctx, ratio );
			} );
			ctx.rotate( -this.rotation );
			ctx.translate( -this.position.x / ratio, -this.position.y / ratio );
		}
  };
}

TWO.text = function( text, x, y, fillStyle, font, fontSize, otherParams, opacity ) {
	text = text || "";
	x = x || 0;
	y = y || 0;
	fillStyle = fillStyle || "#000000";
	font = font || "Arial";
	fontSize = fontSize || 30;
	otherParams = otherParams || "";
	opacity = opacity || 1;
	return {
		text: text,
		position: new TWO.Vector2( x, y ),
		size: 1,
		fillStyle: fillStyle,
		font: font,
		fontSize: fontSize,
		opacity: opacity,
		otherParams: otherParams,
		rotation: 0,
		type: "text",
		objects: [],
		add: function( object ) {
			this.objects.push( object );
		},
		remove: function( object ) {
			if( this.objects.indexOf( object ) != -1 )
				this.objects.splice( this.objects.indexOf( object ), 1 );
		},
		render: function( ctx, ratio ) {
			ctx.globalAlpha = this.opacity;
			ctx.font = this.otherParams + " " + this.fontSize * this.size / ratio + "px " + this.font;
			var width = ctx.measureText( this.text ).width;
			ctx.fillStyle = this.fillStyle;
			ctx.translate( this.position.x / ratio, this.position.y / ratio );
			ctx.rotate( this.rotation );
			ctx.fillText( this.text, Math.floor( -width / 2 ), this.fontSize / 3 / ratio );
			this.objects.forEach( function( object ) {
				object.render();
			} );
			ctx.rotate( -this.rotation );
			ctx.translate( -this.position.x / ratio, -this.position.y / ratio );
		}
	};
}

TWO.Vector2 = function( x, y ) {
	return {
		x: x,
		y: y,
		clone: function() {
			return new TWO.Vector2( this.x, this.y );
		}
	};
}

TWO.Vector3 = function( x, y, z ) {
	return {
		x: x,
		y: y,
		z: z,
		clone: function() {
			return new TWO.Vector3( this.x, this.y, this.z );
		}
	};
}

TWO.Vector4 = function( x, y, z, w ) {
	return {
		x: x,
		y: y,
		z: z,
		w: w,
		clone: function() {
			return new TWO.Vector4( this.x, this.y, this.z, this.w );
		}
	};
}

TWO.controls = function() {
	return {
		up: false,
		down: false,
		left: false,
		right: false,
		space: false,
		shift: false,
		changed: false
	};
}

TWO.multiplayerControls = function() {
	return {
		key_up: false,
		key_down: false,
		key_left: false,
		key_right: false,
		key_w: false,
		key_s: false,
		key_a: false,
		key_d: false,
		space: false,
		shift: false,
		changed: false
	};
}

TWO.keyboard = function( control ) {
  
  control = control || new TWO.controls();
  
  function down(e) {
    var changed = false;
    if (e.keyCode == 37 || e.keyCode == 65) {
      if (!control.left) {
        changed = true;
        control.left = true;
      }
    } else if (e.keyCode == 38 || e.keyCode == 87) {
      if (!control.up) {
        changed = true;
        control.up = true;
      }
    } else if (e.keyCode == 39 || e.keyCode == 68) {
      if (!control.right) {
        changed = true;
        control.right = true;
      }
    } else if (e.keyCode == 40 || e.keyCode == 83) {
      if (!control.down) {
        changed = true;
        control.down = true;
      }
    } else if (e.keyCode == 32) {
      if (!control.space) {
        changed = true;
        control.space = true;
      }
    } else if (e.keyCode == 16) {
      if (!control.shift) {
        changed = true;
        control.shift = true;
      }
    }
		control.changed = changed;
  }
  
  window.addEventListener('keydown', down, false);

  function up(e) {
    if (e.keyCode == 37 || e.keyCode == 65)
      control.left = false;
    else if (e.keyCode == 38 || e.keyCode == 87)
      control.up = false;
    else if (e.keyCode == 39 || e.keyCode == 68)
      control.right = false;
    else if (e.keyCode == 40 || e.keyCode == 83)
      control.down = false;
    else if (e.keyCode == 32)
      control.space = false;
    else if (e.keyCode == 16)
      control.shift = false;
		control.changed = true;
  }
  
  window.addEventListener('keyup', up, false);
  
  return control;
  
}

TWO.multiplayerKeyboard = function( control ) {
  
  control = control || new TWO.controls();
  
  function down(e) {
    var changed = false;
    if (e.keyCode == 65) {
      if (!control.key_a) {
        changed = true;
        control.key_a = true;
      }
    } else if (e.keyCode == 37) {
      if (!control.key_left) {
        changed = true;
        control.key_left = true;
      }
    } else if (e.keyCode == 87) {
      if (!control.key_w) {
        changed = true;
        control.key_w = true;
      }
    } else if (e.keyCode == 38) {
      if (!control.key_up) {
        changed = true;
        control.key_up = true;
      }
    } else if (e.keyCode == 68) {
      if (!control.key_d) {
        changed = true;
        control.key_d = true;
      }
    } else if (e.keyCode == 39) {
      if (!control.key_right) {
        changed = true;
        control.key_right = true;
      }
    } else if (e.keyCode == 83) {
      if (!control.key_s) {
        changed = true;
        control.key_s = true;
      }
    } else if (e.keyCode == 40) {
      if (!control.key_down) {
        changed = true;
        control.key_down = true;
      }
    } else if (e.keyCode == 32) {
      if (!control.space) {
        changed = true;
        control.space = true;
      }
    } else if (e.keyCode == 16) {
      if (!control.shift) {
        changed = true;
        control.shift = true;
      }
    }
		control.changed = changed;
  }
  
  window.addEventListener('keydown', down, false);

  function up(e) {
    if (e.keyCode == 37)
      control.key_left = false;
		else if (e.keyCode == 65)
			control.key_a = false;
    else if (e.keyCode == 38)
      control.key_up = false;
		else if (e.keyCode == 87)
			control.key_w = false;
    else if (e.keyCode == 39)
      control.key_right = false;
		else if (e.keyCode == 68)
			control.key_d = false;
    else if (e.keyCode == 40)
      control.key_down = false;
		else if (e.keyCode == 83)
			control.key_s = false;
    else if (e.keyCode == 32)
      control.space = false;
    else if (e.keyCode == 16)
      control.shift = false;
		control.changed = true;
  }
  
  window.addEventListener('keyup', up, false);
  
  return control;
  
}

TWO.rectangle = function( x, y, width, height, color, opacity ) {
  x = x || 0;
  y = y || 0;
  width = width || 100;
  height = height || 100;
  color = color || "#000000";
	opacity = opacity || 1;
  return {
    width: width,
    height: height,
		rotation: 0,
		opacity: opacity,
    position: new TWO.Vector2( x, y ),
		size: 1,
    color: color,
    type: "rectangle",
    forceMultiplier: 1,
		objects: [],
		add: function( object ) {
			this.objects.push( object );
		},
		remove: function( object ) {
			if( this.objects.indexOf( object ) != -1 )
				this.objects.splice( this.objects.indexOf( object ), 1 );
		},
		render: function( ctx, ratio ) {
			ctx.globalAlpha = this.opacity;
			ctx.translate( this.position.x / ratio, this.position.y / ratio );
			ctx.rotate( this.rotation );
      ctx.fillStyle = this.color;
      ctx.fillRect( -this.width * this.size / 2 / ratio, - this.height * this.size / 2 / ratio, this.width * this.size / ratio, this.height * this.size / ratio );
			for( var i = 0; i < this.objects.length; i++ ) {
				this.objects[i].render( ctx, ratio / this.size );
			}
			ctx.rotate( -this.rotation );
			ctx.translate( -this.position.x / ratio, -this.position.y / ratio );
		}
  };
}

TWO.blurredRectangle = function( x, y, width, height, color, blurRadius, opacity ) {
  x = x || 0;
  y = y || 0;
  width = width || 100;
  height = height || 100;
  color = color || "#000000";
	blurRadius = blurRadius || 3;
	opacity = opacity || 1;
	var canvas = document.createElement( 'canvas' );
	canvas.width = width + blurRadius * 4;
	canvas.height = height + blurRadius * 4;
	var ctx = canvas.getContext( '2d' );
	ctx.fillStyle = color;
	ctx.filter = 'blur( ' + blurRadius + 'px )';
	ctx.globalAlpha = opacity;
	ctx.fillRect( blurRadius * 2, blurRadius * 2, width, height );
  return new TWO.image( canvas, x, y, width, height );
}

TWO.circle = function( x, y, radius, color ) {
  x = x || 0;
  y = y || 0;
  radius = radius || 100;
  color = color || "#000000";
  return {
    radius: radius,
		opacity: 1,
    position: new TWO.Vector2( x, y ),
		size: 1,
    color: color,
    type: "circle",
		objects: [],
		add: function( object ) {
			this.objects.push( object );
		},
		remove: function( object ) {
			if( this.objects.indexOf( object ) != -1 )
				this.objects.splice( this.objects.indexOf( object ), 1 );
		},
		render: function( ctx, ratio ) {
			ctx.globalAlpha = this.opacity;
			ctx.translate( this.position.x / ratio, this.position.y / ratio );
			ctx.fillStyle = this.color
			ctx.beginPath();
			ctx.arc( 0, 0, this.radius * this.size / ratio, 0, 2 * Math.PI );
			ctx.fill();
			this.objects.forEach( function( object ) {
				object.render( ctx, ratio );
			} );
			ctx.translate( -this.position.x / ratio, -this.position.y / ratio );
		}
  };
}

TWO.arc = function( x, y, radius, color, angle, lineWidth ) {
  x = x || 0;
  y = y || 0;
  radius = radius || 100;
  color = color || "#000000";
	angle = angle || Math.PI;
	lineWidth = lineWidth || 5;
  return {
    radius: radius,
		opacity: 1,
		angle: angle,
		lineWidth: lineWidth,
    position: new TWO.Vector2( x, y ),
		size: 1,
		rotation: 0,
    color: color,
    type: "circle",
		objects: [],
		add: function( object ) {
			this.objects.push( object );
		},
		remove: function( object ) {
			if( this.objects.indexOf( object ) != -1 )
				this.objects.splice( this.objects.indexOf( object ), 1 );
		},
		render: function( ctx, ratio ) {
			ctx.globalAlpha = this.opacity;
			ctx.translate( this.position.x / ratio, this.position.y / ratio );
			ctx.strokeStyle = this.color;
			ctx.lineWidth = lineWidth / ratio;
			ctx.rotate( this.rotation );
			ctx.beginPath();
			ctx.arc( 0, 0, this.radius * this.size / ratio, 0, this.angle );
			ctx.stroke();
			this.objects.forEach( function( object ) {
				object.render( ctx, ratio );
			} );
			ctx.rotate( -this.rotation );
			ctx.translate( -this.position.x / ratio, -this.position.y / ratio );
		}
  };
}

TWO.blurredCircle = function( x, y, radius, color, blurRadius ) {
  x = x || 0;
  y = y || 0;
  radius = radius || 100;
  color = color || "#000000";
	blurRadius = blurRadius || 3;
	var canvas = document.createElement( 'canvas' );
	canvas.width = radius * 2 + blurRadius * 4;
	canvas.height = radius * 2 + blurRadius * 4;
	var ctx = canvas.getContext( '2d' );
	ctx.fillStyle = color;
	ctx.filter = 'blur( ' + blurRadius + 'px )';
	ctx.beginPath();
	ctx.arc( radius + blurRadius * 2, radius + blurRadius * 2, radius, 0, 2 * Math.PI );
	ctx.fill();
  return new TWO.image( canvas, x, y, radius * 2, radius * 2.3 );
}

TWO.scene = function() {
  return {
    objects: [],
    add: function( object ) {
      this.objects.push( object );
    },
	remove: function( object ) {
		if( this.objects.indexOf( object ) != -1 )
			this.objects.splice( this.objects.indexOf( object ), 1 );
	},
	clear: function() {
		this.objects.splice(0, this.objects.length);
	},
    camera: {
      position: new TWO.Vector2( 0, 0 ),
      ratio: 1,
			rotation: 0
    },
    render: function( ctx, ratio ) {
			ctx.rotate( this.camera.rotation );
			ctx.translate(this.camera.position.x / this.camera.ratio, this.camera.position.y / this.camera.ratio);
      this.objects.forEach( function( object ) {
        object.render( ctx, ratio );
      });
			ctx.rotate( -this.camera.rotation );
			ctx.translate( -this.camera.position.x / this.camera.ratio, -this.camera.position.y / this.camera.ratio);
    }
  };
}

TWO.timestep = function(target) {
	return {
		deltaTime: 0.0,
		currentTime: 0.0,
		lastFrameTime: Date.now(),
		realTime: 0.0,
		frameTime: 0.0,
		targetFPS: target,
		tick: function () {
			this.currentTime = Date.now();
			this.realTime = this.currentTime - this.lastFrameTime;
			this.lastFrameTime = this.currentTime;
			this.deltaTime = this.realTime / (1.0 / this.targetFPS) / 1000;
			this.realTime = this.realTime / 1000.0;
		}
	};
}