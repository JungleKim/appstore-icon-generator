
$(function() {
  if (!checkFileAPI()) {
    showError('The File APIs are not fully supported in this browser.');
    return;
  }

  // Exists File API
  makeImageFactory();
  blockMovePage();

  var generator = $('.generator');
  generator.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
  })
  .on('dragenter', function() {
    generator.addClass('dragover');
  })
  .on('dragleave dragend drop', function() {
    generator.removeClass('dragover');
  })
  .on('drop', dropImage);

  var fileinput = $('.generator__file');
  fileinput.on('change', dropImage);

  $('.action .button.clear').on('click', function() {
    ImageFactory.clear();
  });
  $('.action .button.save').on('click', function() {
    ImageFactory.save();
  });
});

var checkFileAPI = function() {
  return window.File && window.FileReader
    && window.FileList && window.Blob;
};

var makeImageFactory = function() {
  ImageFactory({
    'validators': [
      function(file) {
        return new Promise(function(resolve, rejected) {
          if(!file.type.match(/image\/(png|jpe?g)/)) {
            rejected('Only Supported png|jpe?g');
          }
          resolve(true);
        });
      },
      function(file) {
        return new Promise(function(resolve, rejected) {
          var reader = new FileReader();

          reader.onload = resolve;
          reader.onerror = rejected;

          reader.readAsDataURL(file);
        })
        .then(function(e) {
          var img = new Image();
          img.src = e.target.result; // Base64

          if (img.width === 1024 && img.height === 1024) {
            return true;
          }

          return "Only Supported 1024x1024 Image";
        });
      },
    ],
    'callback': callback, 
  });
};

var blockMovePage = function() {
  $(window).on('dragover', function(e) {
    e.preventDefault();
  });
  $(window).on('drop', function(e) {
    e.preventDefault();
  });
};

var dropImage = function(e) {
  var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
  if (files.length > 1) {
    showError("Do Not Support Multiple Image!");
    return;
  }

  ImageFactory.setFile(files[0]);
};

var callback = function(type, data) {

  if (type === ImageFactory.callbackType['FileInValid'] ||
      type === ImageFactory.callbackType['FileValid'] ||
      type === ImageFactory.callbackType['SaveFail']) {
    $('.generator__input').removeClass('show');
    $('.generator__msg').addClass('show').html(data.msg);

    if(type === ImageFactory.callbackType['FileValid']) {
      $('.action .button.save').removeClass('in-active');
      $('.generator__msg').removeClass('error');
    } else {
    $('.action .button.save').addClass('in-active');
      $('.generator__msg').addClass('error');
    }
  } else if (type === ImageFactory.callbackType['Clear']) {
    $('.action .button.save').addClass('in-active');
    $('.generator__input').addClass('show');
    $('.generator__msg').removeClass('show').html('');
  } else if (type === ImageFactory.callbackType['SaveSuccess']) {
  }
};

