function GUI3D( name , controls , params){

  this.controls = controls;
  
  var params = params || {};
  this.params = params;

  this.sliders = [];


  /*
   

     Assigning Params!!!


  */
 
  // For text
  this.textColor        = params.textColor || "#ffffff"
  this.textSize         = params.textSize  || "50"
  this.textFont         = params.textFont  || "GeoSans"
  
  this.titleSize        = params.titleSize || 10


  this.sliderTitleSize  = params.sliderTitleSize  || 4
  this.sliderWidth      = params.sliderWidth      || 100;
  this.sliderHeight     = params.sliderHeight     || 10;
  this.sliderDepth      = params.sliderDepth      || 2;
  this.sliderSpacing    = params.sliderSpacing    || 20;
  
  // Setting up Materials!  
  this.knobMat = params.knobMat || new THREE.MeshBasicMaterial({
    color:0xff0000, 
  });

  this.fillMat = params.fillMat || new THREE.MeshBasicMaterial({
    color:0xffffff, 
  });

  this.fullMat = params.fullMat || new THREE.MeshBasicMaterial({
    color:0x666666, 
  });

  this.bgMat = params.bgMat || new THREE.MeshBasicMaterial({
    color:0xffffff,
    wireframe:true
  });


  this.knobGeo = params.knobGeo || new THREE.BoxGeometry( 
      this.sliderWidth / 30 , 
      this.sliderHeight * 1.1 , 
      this.sliderDepth * 2 
  );

  this.fullGeo = params.fullGeo || new THREE.PlaneBufferGeometry( 
    this.sliderWidth ,
    this.sliderHeight
  ); 

  this.fillGeo = params.fillGeo || new THREE.BoxGeometry( 
    1 , 
    this.sliderHeight,
    this.sliderDepth
  ); 

 
  this.bgGeo = params.fillGeo || new THREE.PlaneGeometry( 
    this.sliderWidth + this.sliderSpacing/2 , 
    1 
  );


  /*

     SETTING UP SCENE!!!

  */
  this.scene = new THREE.Object3D();

  this.position = this.scene.position;
  this.body = this.scene;


  this.background = new THREE.Mesh( this.bgGeo , this.bgMat );

  this.background.hoverOver = this._backgroundHoverOver.bind(  this );
  this.background.hoverOut  = this._backgroundHoverOut.bind(   this );
 
  this.scene.add( this.background );

  this.controls.addSingle( this.background );

  this.title = this.createTitle( name );
  this.title.scale.multiplyScalar( this.sliderSpacing / 2 );
  this.scene.add( this.title );
  this.title.position.z = this.sliderDepth;
  var x = -this.sliderWidth / 2 + this.title.totalWidth * this.sliderSpacing * .5 * .5

  this.title.position.x = x 

}


GUI3D.prototype.createSlider = function( name , uniform , params){
  
  var params = params || {};

  // The slider is a OBJECT3D!!!
  var slider = new THREE.Object3D();
  
  // makes sure we have all the utility functions we need
  slider.gui = this;


  slider.params = params;

  slider.uniform     = uniform;
  slider.constraints = uniform.constraints;
  if( !uniform.constraints ){
    var lo = uniform.value / 2;
    var hi = uniform.value * 2;
    slider.constraints = [ lo , hi ];
  }

  slider.range = slider.constraints[1] - slider.constraints[0];



  var title = this.createTitle( name );
  
  title.scale.multiplyScalar( this.titleSize );

  var y =  this.sliderHeight / 2 + title.totalHeight * this.titleSize * .5;
  var x = -this.sliderWidth  / 2 + title.totalWidth  * this.titleSize * .5; 
 
  title.position.y = y;
  title.position.x = x;
  title.position.z = this.sliderDepth * .8;
  

  var knob = new THREE.Mesh( this.knobGeo , this.knobMat );
  knob.position.z = this.sliderDepth * .5;




  var full = new THREE.Mesh( this.fullGeo , this.fullMat );

  var fill = new THREE.Mesh( this.fillGeo , this.fillMat );
  fill.position.z = this.sliderDepth / 2;

  var iPlane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 10000 , 10000 ),
      new THREE.MeshBasicMaterial({side: THREE.DoubleSide })
  );
  iPlane.visible = false;
  

  slider.iPlane  = iPlane;
  slider.add( iPlane );

  slider.title = title;
  slider.add( title );

  slider.knob = knob;
  slider.add( knob );

  slider.full = full;
  slider.add( full );

  slider.fill = fill;
  slider.add( fill );

  slider.left  = - this.sliderWidth / 2;
  slider.right =   this.sliderWidth / 2;



  knob.hoverOver = this._hoverOver.bind(  slider );
  knob.hoverOut  = this._hoverOut.bind(   slider );
  knob.select    = this._select.bind(     slider );
  knob.deselect  = this._deselect.bind(   slider );
  knob.update    = this._update.bind(     slider );

  fill.hoverOver = this._hoverOver.bind(  slider );
  fill.hoverOut  = this._hoverOut.bind(   slider );
  fill.select    = this._select.bind(     slider );
  fill.deselect  = this._deselect.bind(   slider );
  fill.update    = this._update.bind(     slider );
  
  full.hoverOver = this._hoverOver.bind(  slider );
  full.hoverOut  = this._hoverOut.bind(   slider );
  full.select    = this._select.bind(     slider );
  full.deselect  = this._deselect.bind(   slider );
  full.update    = this._update.bind(     slider );


  this.sliders.push( slider );
  this.controls.add( knob );
  this.controls.add( fill );
  this.controls.add( full );

  this.scene.add( slider );

  var p = this.getPositionFromValue( slider ,  uniform.value );
  knob.position.x = p;
  this.resizeFill( slider , uniform.value ); 

  // Doing stuff to properly place the slider within
  // the 3D GUI
  slider.position.y = -(this.sliders.length)  * this.sliderSpacing;
  slider.position.z = this.sliderDepth * .3;
  this.background.scale.y = (this.sliders.length+1) * this.sliderSpacing;
  this.background.position.y = -(this.background.scale.y-this.sliderSpacing) / 2;
  //this.background.position.z = - this.sliderDepth * .3;

  this.getSize();
}

GUI3D.prototype.getSize = function(){

  this.height = this.sliders.length * this.sliderSpacing;

  this.width = this.sliderWidth + this.sliderSpacing / 2;

}

GUI3D.prototype.createUniformSliders = function( uniforms ){

  for( var propt in uniforms ){

    console.log( propt );
    if( uniforms[ propt ].type == "f" ){
      this.createSlider( propt , uniforms[ propt ] );
    }

  }

}

/*

   Some Utility Functions!!!!

*/

GUI3D.prototype.getPositionFromValue = function( slider , value ){

  var p = this.getPercentage( value , slider.constraints );
  return slider.left + this.sliderWidth * p;

}

GUI3D.prototype.getPercentage  = function( value , constraints ){

  var v = value - constraints[0];
  var r = constraints[1] - constraints[0];

  return v / r;

}


GUI3D.prototype.resizeFill = function( slider ,  value ){

  var p = this.getPercentage( value , slider.constraints );

  slider.fill.scale.x = this.sliderWidth * p;
  slider.fill.position.x = slider.left + this.sliderWidth * p * .5;
 
  //incase of zero scale
  if( slider.fill.scale.x == 0  ){ slider.fill.scale.x = 0.00000001 };

}

GUI3D.prototype.getValueFromPosition = function( slider , position ){

  var l = position.x - slider.left;
  var r = slider.right - slider.left;
  var percentage = l/r;
  
  return percentage * slider.range + slider.constraints[0];

}


GUI3D.prototype.updateSlider = function( slider ){

  var i = this.controls.raycaster.intersectObject( slider.iPlane );

  
  slider.knob.position.x = i[0].point.x - slider.position.x - this.position.x;

  var p = slider.knob.position;
  
  if( p.x < slider.left ){ p.x = slider.left }
  if( p.x > slider.right ){ p.x = slider.right }
  
  var value = this.getValueFromPosition( slider , slider.knob.position );
 
  this.resizeFill( slider , value );
  
  slider.uniform.value = value;

}


/*
 
   
   Object Control Functions


*/

GUI3D.prototype._backgroundHoverOver = function(){

  this.scene.scale.z = 1;
  this.title.material.opacity = 1;
  
  if( this.params.backgroundHoverOver ){
    var cb = this.params.backgroundHoverOver.bind( this );
    cb();
  }

}

GUI3D.prototype._backgroundHoverOut = function(){

  this.scene.scale.z = .1;
  this.title.material.opacity = .4;

  if( this.params.backgroundHoverOut ){
    var cb = this.params.backgroundHoverOut.bind( this );
    cb();
  }

}


/*
 
  BOUND TO SLIDER FUNCTIONS

*/
GUI3D.prototype._hoverOver = function( i ){

   this.title.material.opacity = .7;

  if( this.gui.params.sliderhoverOver ){

    var cb = this.gui.params.sliderHoverOver.bind( this );
    cb( i );

  }

}

GUI3D.prototype._hoverOut = function( i ){

  this.title.material.opacity = .4;
  if( this.gui.params.sliderhoverOut ){

    var cb = this.gui.params.sliderHoverOut.bind( this );
    cb( i );

  }

}

GUI3D.prototype._select = function( i ){

   this.title.material.opacity = 1;

  if( this.gui.params.sliderSelect ){

    var cb = this.gui.params.sliderSelect.bind( this );
    cb( i );

  }

}

GUI3D.prototype._deselect = function( i ){

   this.title.material.opacity = .7;

  if( this.gui.params.sliderDeselect ){

    var cb = this.gui.params.sliderDeselect.bind( this );
    cb( i );

  }

}

GUI3D.prototype._update = function( i ){

 // console.log( this.gui );
  var cb = this.gui.updateSlider.bind( this.gui );
  cb( this );

  if( this.gui.params.sliderUpdate ){

    var cb = this.gui.params.sliderUpdate.bind( this );
    cb( i );

  }

}



/*
 

   UTILS FOR CREATING TEXTURES



*/

GUI3D.prototype.createTitle = function( string ){

  // for writing text
  this.canvas = document.createElement('canvas');

  document.body.appendChild( this.canvas );
  this.ctx = this.canvas.getContext( '2d' );

  // Makes sure our text is centered
  this.ctx.textAlign = "center";
  this.ctx.textBaseline = "middle";

  var size = this.textSize;
  console.log( this.textSize );
  this.ctx.font = this.textSize + "pt " +" GeoSans";
  var textWidth = this.ctx.measureText(string).width;
  var mSize = textWidth;


  this.canvas.width  = mSize;//sqr;
  this.canvas.height = this.textSize * 1.6 //sqr;

  this.ctx.fillStyle = this.textColor 
 
  this.ctx.textAlign = "center";
  this.ctx.textBaseline = "middle";
  this.ctx.font = this.textSize +"pt " + this.textFont;//GeoSans";


  this.ctx.fillText( string , this.canvas.width / 2, this.canvas.height / 2);

  var texture = new THREE.Texture( this.canvas );
  texture.scaledWidth = this.canvas.width;
  texture.scaledHeight = this.canvas.height;

  texture.needsUpdate = true;

  var material = new THREE.MeshBasicMaterial({
    map:          texture,
    transparent:  true,
   // blending:     THREE.AdditiveBlending,
    depthwrite:   false,
    opacity:      .4,
    color:        0xffffFF
  });

  var geo = new THREE.PlaneGeometry( 
    texture.scaledWidth, 
    texture.scaledHeight
  );

  var mesh = new THREE.Mesh(geo, material);
  mesh.scale.multiplyScalar(  1 /this.textSize);
  mesh.scaledWidth  = texture.scaledWidth;
  mesh.scaledHeight = texture.scaledHeight;

  
  mesh.totalWidth = mesh.scaledWidth * (1/this.textSize);
  mesh.totalHeight = mesh.scaledHeight * (1/this.textSize);

  console.log( 'SSSD ');

  console.log( mesh.totalWidth );
  mesh.string = string;
  return mesh;

}



