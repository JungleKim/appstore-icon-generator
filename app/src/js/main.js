
$(function() {
  if (!checkFileAPI()) {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }

  // Exists File API
  makeImageFactory();
  blockMovePage();
  draggable();

  $('.button').on('click', function() {
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
            rejected('Not Supported FileType');
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
        }).then(function(e) {
          var img = new Image();
          img.src = e.target.result; // Base64

          if (img.width === 1024 && img.height === 1024) {
            return true;
          }

          return false;
        }, function() {
          return 'File Load Error';
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

var draggable = function() {
  var dndObject = $('.dnd');
  dndObject.on('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
    if (files.length > 1) {
      alert("Do Not Support Multiple Image");
    }

    ImageFactory.setFile(files[0]);
  });

  dndObject.on('dragover', function(e) {
    // TODO Animation?
    // 마우스 위치에서 눈내리는것 만들기 ㅎ
  });

  dndObject.on('dragenter dragleave', function(e) {
    console.log('dragenter || dragleave');

    e.preventDefault();
    e.stopPropagation();
  });
};

var callback = function(type, data) {
  console.log(type);
};
