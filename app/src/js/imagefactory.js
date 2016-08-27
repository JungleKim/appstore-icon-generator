
(function(global, undefined) {
  'use strict';
  
  var factory = function() {
    var ImageFactory = function(config) {
      config = config || {};

      if ('validators' in config) {
        var validatorType = Object.prototype.toString.call(config['validators']);
        if (validatorType === '[object Array]') {
          ImageFactory.validators = config['validators'];
        } 
        // Validator Function Spec
        // function(file) { return Promise }
      }

      if ('callback' in config) {
        ImageFactory.callback = config['callback'];
        // Callback Function Spec
        // function(type) { }
        // Type is ImageFatory.callbackType
      }
    };

    ImageFactory.currentFile = undefined; // current File
    ImageFactory.callbackType = {
      'FileInValid': 0,
      'FileValid': 1,
      'Progress': 2,
    };

  
    ImageFactory.setFile = function(file) {
      var $this = this;
      var promises = (this.validators || []).map(function(validator) {
        return validator(file);
      });
      Promise.all(promises).then(function(value) {
        var isValid = true;
        value.forEach(function(vvalue, index) {
          isValid &= vvalue;
        });

        var type = 'FileInValid';
        if (isValid) {
          $this.currentFile = file;
          type = 'FileValid';
        }

        if ($this.callback) {
          $this.callback(
            $this.callbackType[type], 
            {file: $this.currentFile}
          );
        }
      }, function(reason) {
        console.log(reason);
        if ($this.callback) {
          $this.callback($this.callbackType['FileInValid']);
        }
      });
    };
  
    ImageFactory.clear = function() {
      this.currentFile = undefined;
    };

    ImageFactory.save = function(options) {
      if (this.currentFile == undefined) {
        alert('Need Icon File');
        return;
      }

      options = options || { assets: true };
      // File열심히 Generator
      
      if (options['assets']) {
        // Make Content.json
      }
    };


    return ImageFactory;
  };


  global.ImageFactory = factory(); 
})(typeof window === 'undefined' ? this : window);