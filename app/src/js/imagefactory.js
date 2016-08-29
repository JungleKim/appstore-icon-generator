
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
      'Clear': 2,
      'SaveFail': 3,
      'SaveSuccess': 4,
    };

    ImageFactory.sendCallback = function(type, data) {
      if (this.callback && type in this.callbackType) {
        this.callback(this.callbackType[type], data);
      }
    };
  
    ImageFactory.setFile = function(file) { var self = this;
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
          self.currentFile = file;
          type = 'FileValid';
        }

        self.sendCallback(type, {msg: self.currentFile.name});
      }, function(reason) {
        self.sendCallback('FileInValid', {msg: reason});
      });
    };
  
    ImageFactory.clear = function() {
      this.currentFile = undefined;
      this.sendCallback('Clear');
    };

    ImageFactory.save = function() {
      if (this.currentFile == undefined) {
        this.sendCallback('SaveFail', {msg: 'Not Exist File'});
        return;
      }

      var self = this;
      new Promise(function(resolve, rejected) {
        var reader = new FileReader();

        reader.onload = resolve;
        reader.onerror = rejected;

        reader.readAsDataURL(self.currentFile);
      })
      .then(function(e) {
        return TVHL.makeResizePromises(e.target.result);
      }, function() {})
      .then(function(files) {
        var zip = new JSZip();
        zip.file(iOS.ContentsName, JSON.stringify(iOS.Contents));
        files.forEach(function(file, index) {
          zip.file(
            file.filename, 
            file.data.replace('data:image/png;base64,', ''), 
            {base64: true});
        });

        return zip.generateAsync({type: 'blob'});
      })
      .then(function(content) {
        saveAs(content, iOS.assetName+'.zip');
        self.sendCallback('SaveSuccess');
      });
    };

    var TVHL = {};
    TVHL.makeResizePromises = function(fileData) {
      var promises = [];
      iOS.icons.forEach(function(fileInfo, index) {
        promises.push(
          TVHL.resizePromise(
            fileData, 
            fileInfo.size, 
            fileInfo.scale
          )
        );
      });

      return Promise.all(promises);
    };

    TVHL.resizePromise = function(fileData, size, scale) {
      return new Promise(function(resolve, rejected) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var image = new Image();
        image.onload = function() {
          canvas.width = size.width * scale;
          canvas.height = size.height * scale;
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL()); // resolve
        };
        image.onerror = rejected;

        image.src = fileData;
      }).then(function(data) {
        var filename = "Icon-"+size.width; //Icon-29
        if (scale != 1) {
          filename += "@"+scale+"x";
        }
        filename += ".png";

        return {data: data, filename: filename};
      }, function() {
        // rejected
        console.log('Reject: '+size);
      });
    };

    return ImageFactory;
  };

  global.ImageFactory = factory(); 
})(typeof window === 'undefined' ? this : window);
