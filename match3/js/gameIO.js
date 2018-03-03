class GameObj {
	constructor() {
		this.position = {x: 0, y: 0};
		this.rotation = 0;
		this.size = 1;
		this.type = "object";
		this.ctx = FRAME.ctx;
		this.parent = null;
	}
	remove() {}
	add() {}
	update() {}
	render() {}
	draw() {
		this.ctx.translate(this.position.x, this.position.y);
		this.ctx.rotate(this.rotation);
		this.render();
		this.ctx.rotate(-this.rotation);
		this.ctx.translate(-this.position.x, -this.position.y);
	}
}

function gameIO() {
	var game = {};
	game.Vector2 = function( x, y ) {
    return {
      x: x || 0,
      y: y || 0,
      clone: function() {
        return new game.Vector2( this.x, this.y );
      }
    };
  }
  game.socket = function( ip, onmessage, onopen, onclose, onerror ) {
    if ( ip === undefined )
      return null;
    var socket = new WebSocket( ip );
    socket.onmessage = onmessage || function() {};
    socket.onopen = onopen || function() {};
    socket.onclose = onclose || function() {};
    socket.onerror = onerror || function() {};
    return socket;
  };
  // Networking Portion
  game.me = { id: -1, score: 0, visual: { position: new game.Vector2( 0, 0 ) }, new: { position: new game.Vector2( 0, 0 ) }, old: { position: new game.Vector2( 0, 0 ) } };
  game.ws = { readyState: -1, send: function() { }, close: function() { } };
  game.connecting = false;
	game.spectating = true;
	game.currentPackets = [];

  game.createSocket = function( serveraddr ) {
    if( game.connecting )
      return;
    game.connecting = true;
    game.ws.close();
    function open() {
      game.connecting = false;
    }
    game.ws = new game.socket( serveraddr, game.messageEvent, open );
		game.ws.binaryType = "arraybuffer";
  }

  game.serverDetails = {
    lastFrame : Date.now(),
    thisFrame : Date.now(),
    dt : 1,
    ticksSincePacket : 0
  };

  game.clientDetails = {
    lastFrame : Date.now(),
    thisFrame : Date.now(),
    dt : 1
  };

	game.toBuffer = function( string ) {
		var buf = new ArrayBuffer( string.length );
		var bufView = new Uint8Array( buf );
		for( var i = 0, strLen = string.length; i < strLen; i++ ) {
			bufView[ i ] = string.charCodeAt( i );
		}
		return buf;
	}

	game.fromBuffer = function( buffer ) {
		try {
			return String.fromCharCode.apply( null, new Uint8Array( buffer ) );
		} catch( e ) {
		}
	}

  game.selfExists = function() {
    for( var i = 0; i < game.objects.length; i++ ) {
      if( game.objects[ i ].id == game.me.id ) {
        return true;
      }
    }
    if( game.ws.readyState == 1 ) {
      game.ws.send( game.toBuffer( JSON.stringify( [ { type: "getID" } ] ) ) );
    }
  }

	game.notUpdatedIsClose = function( object ) {
		if( Math.abs( game.me.new.position.x - object.new.position.x ) < 1920 / 2 + 1600 && Math.abs( game.me.new.position.y - object.new.position.y ) < 1080 / 2 + 1600 )
			return true;
	}

	game.visualIsClose = function( object ) {
		if( Math.abs( game.me.new.position.x - object.position.x ) < 1920 / 2 + 1600 && Math.abs( game.me.new.position.y - object.position.y ) < 1080 / 2 + 1600 )
			return true;
	}

  game.lerp = function( initialValue, newValue ) {
		if( game.serverDetails.ticksSincePacket > game.serverDetails.dt + 1 )
			return newValue;
		return ( newValue - initialValue ) / game.serverDetails.dt * game.serverDetails.ticksSincePacket + initialValue;
	}

  game.getObj = function( id ) {
    for( var i = 0; i < game.objects.length; i++ ) {
      if( game.objects[ i ].id == id ) {
        return game.objects[ i ];
      }
    }
    return null;
  }

  game.askForObj = function( id ) {
    game.currentPackets.push( { type: "getObject", object: { id: id } } );
  }

  game.packetFunctions = {
    "setID" : function( packet ) {
			game.spectating = packet.s;
      for( var i = 0; i < game.objects.length; i++ ) {
        if( game.objects[ i ].id == packet.id ) {
          game.me = game.objects[ i ];
        }
      }
    },
		// Add
    "x" : function( packet ) {
      if( game.getObj( packet.i ) != null ) {
        return null;
      }
      var obj = {
        new : {
          position: new game.Vector2( packet.x, packet.y ),
          rotation: packet.a
        },
        old : {
          position: new game.Vector2( packet.x, packet.y ),
          rotation: packet.a
        },
        id : packet.i,
				ticksAsleep : 0,
        visual : new GameObj(),
        type : packet.b,
				needsUpdate : packet.n
      };
      game.types[ packet.b ].create( obj, packet );
			obj.visual.position.x = obj.new.position.x;
			obj.visual.position.y = obj.new.position.y;
			obj.visual.rotation = obj.new.rotation;
      game.objects.push( obj );
      return;
    },
		// Update
    "y" : function( packet ) {
      if( game.getObj( packet.i ) == null ) {
        game.askForObj( packet.i );
        return;
      }
      var obj = game.getObj( packet.i );
			obj.ticksAsleep = 0;
      obj.old.position = obj.visual.position.clone();
      obj.old.rotation = obj.visual.rotation;
      obj.new.position = new game.Vector2( packet.x, packet.y );
      obj.new.rotation = packet.a;
			if( Math.abs( obj.old.rotation - obj.new.rotation ) > Math.PI ) {
				if( obj.old.rotation > obj.new.rotation )
					obj.old.rotation -= Math.PI * 2;
				else
					obj.old.rotation += Math.PI * 2;
			}
      game.usedIDs.push( obj.id );
      game.types[ obj.type ].updatePacket( obj, packet );
    },
		// Remove
    "z" : function( packet ) {
      for( var i = 0; i < game.objects.length; i++ ) {
        if( game.objects[ i ].id == packet.i ) {
          game.types[ game.objects[ i ].type ].remove( game.objects[ i ] );
          if( game.objects[ i ].visual.parent != null )
            game.objects[ i ].visual.parent.remove( game.objects[ i ].visual );
          game.objects.splice( i, 1 );
        }
      }
    }
  };
	game.addPacketType = function( type, func ) {
		game.packetFunctions[ type ] = func;
	}
  game.types = [];
  game.objects = [];
  game.usedIDs = [];

  game.messageEvent = function( message ) {
    game.serverDetails.thisFrame = Date.now();
    game.serverDetails.dt = Math.max( Math.min( ( game.serverDetails.thisFrame - game.serverDetails.lastFrame ) / 16, 10 ), 5);
    game.serverDetails.lastFrame = game.serverDetails.thisFrame;
		//try {
			var packets = JSON.parse( game.fromBuffer( message.data ) );
			for( var i = 0; i < packets.length; i++ ) {
				var packet = packets[i];
				if( game.packetFunctions[ packet.t ] !== undefined )
					game.packetFunctions[ packet.t ]( packet );
				else {
					console.log( "Encountered issue: unknown packet type " + packet.t );
					console.log( packets );
                    console.log( new Error().stack );
				}
			}
			game.serverDetails.ticksSincePacket = 0;
			for( var i = 0; i < game.objects.length; i++ ) {
				game.objects[ i ].ticksAsleep++;
				if( game.usedIDs.indexOf( game.objects[ i ].id ) == -1 ) {
					game.objects[ i ].old.position.x = game.objects[ i ].visual.position.x;
					game.objects[ i ].old.position.y = game.objects[ i ].visual.position.y;
					game.objects[ i ].old.rotation = game.objects[ i ].visual.rotation;
				}
				if( ( ( game.objects[ i ].needsUpdate && ( game.objects[ i ].ticksAsleep >= 22 && ( game.objects[ i ].old.position.x == game.objects[ i ].new.position.x && game.objects[ i ].old.position.y == game.objects[ i ].new.position.y && game.objects[ i ].old.rotation == game.objects[ i ].new.rotation ) ) ) || ( !game.objects[ i ].needsUpdate && game.objects[ i ].ticksAsleep >= 120 && !game.notUpdatedIsClose( game.objects[ i ] ) ) ) && game.usedIDs.indexOf( game.objects[ i ].id ) == -1 ) {
					game.types[ game.objects[ i ].type ].remove( game.objects[ i ] );
					if( game.objects[ i ].visual.parent != null )
						game.objects[ i ].visual.parent.remove( game.objects[ i ].visual );
					game.objects.splice( i, 1 );
				}
			}
			game.usedIDs = [];
			game.selfExists();
		//} catch( e ) {
            //console.log( "Caught Error, plx report" );
		//}
  }
  game.update = function() {
    game.serverDetails.ticksSincePacket += 1
    for( var i = 0; i < game.objects.length; i++ ) {
      var obj = game.objects[ i ];
      obj.visual.rotation = game.lerp( obj.old.rotation, obj.new.rotation );
      obj.visual.position.x = game.lerp( obj.old.position.x, obj.new.position.x );
      obj.visual.position.y = game.lerp( obj.old.position.y, obj.new.position.y );
      game.types[ obj.type ].tickUpdate( obj );
    }
    game.clientDetails.thisFrame = Date.now();
    game.clientDetails.dt = ( game.clientDetails.thisFrame - game.clientDetails.lastFrame ) / 16.67;
    game.clientDetails.lastFrame = game.clientDetails.thisFrame;
		if( game.ws.readyState == 1 && game.currentPackets.length > 0 ) {
			game.ws.send( game.toBuffer( JSON.stringify( game.currentPackets ) ) );
			game.currentPackets = [];
		}
  }
  game.addType = function( type, create, tickUpdate, updatePacket, remove ) {
      game.types[ type ] = {
          create : create,
          tickUpdate : tickUpdate || function( obj ) {},
          updatePacket : updatePacket || function( obj, packet ) {},
          remove : remove || function( obj ) {}
      };
  }
	game.addType(
		"spectator",
		function( obj, packet ) {
			obj.visual = new game.object();
		},
		function() {},
		function() {}
	);
  return game;
}