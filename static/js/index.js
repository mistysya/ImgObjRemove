var remove = []; // the boxes that user want to remove.

var last_mousex = last_mousey = 0;
var mousex = mousey = 0;
var mousedown = false;

var image = new Image();

$(document).ready(function(){

    
    $("#file").change(function(){
        var img = this.files[0];
        if (!(img.type.indexOf('image')==0 && img.type && /\.(?:jpg|png|jpeg)$/.test(img.name)) ){
            alert('圖片只能是jpg,jpeg,png');
            return ;
        } 
        
        if(window.FileReader) {
            //console.log(img);
            var fr = new FileReader();
            
            fr.readAsDataURL(img);
            //console.log(fr);
            fr.onloadend = function(e) {
                showimg.src = e.target.result;
                image.src = showimg.src;
            };
        }
    });

    
    
    image.onload = function() {
        var showimg = document.getElementById('showimg');
        var cvs = document.getElementById('showimgcvs');
        var rcvs = document.getElementById('removecvs');

        cvs.width = showimg.width;
        cvs.height = showimg.height;
        rcvs.width = showimg.width;
        rcvs.height = showimg.height;
    }


    $('#Select').change(function() {
        console.log($(this).val());
    });
    
    function downloadImage(src,type) {
        var $a = $("<a></a>").attr("href", src).attr("download", "image."+type);
        $a[0].click();
    }
    
    $('#save').click(function(){
        var src = $('#showimg').attr('src');
        var str = src.split('/',2)[1];
        var type = str.split(';',2)[0];
        downloadImage(src,type);
    
    });
    
    
    $('#Inpainting').click(function(){
        var src = $('#showimg').attr('src');
        //alert(src);
        
        var allRemove;

        $.ajax({
            url: '/complete_image',
            type: 'POST',
            data:{
                'img': src,
                'remove': remove,
                'count': remove.length
            },
            // async: false,
            cache: false,
        }).done(function(res){
            $('#showimg').attr('src',res.img);
            
            
        }).fail(function(){
            console.log("Image inpainting fail");
        });
        
    });
    
    
    $('#Detect').click(function(){
         var src = $('#showimg').attr('src');
         //alert(src);

         $.ajax({
            url: '/detect_image',
            type: 'POST',
            data:{
                'img': src
            },
            // async: false,
            cache: false,
            //contentType: false,
            //processData: false
        }).done(function(res){
            alert('rois:' + res.rois+'\nclass_names:' + res.class_names);
            //console.log(res.rois);
            //console.log(res.class_names);
            var cvs = document.getElementById('showimgcvs');
            var ctx = cvs.getContext("2d");
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            for (var i = 0; i < res.rois.length; i++) {
                var y = res.rois[i][0],x = res.rois[i][1],h = res.rois[i][2]-y,w = res.rois[i][3]-x;

                ctx.rect(x, y, w, h);
            }
            ctx.stroke();
            //select = document.getElementById('Select');
            for (var i = 0; i < res.rois.length; i++) { 
                var y = res.rois[i][0],x = res.rois[i][1],h = res.rois[i][2]-y,w = res.rois[i][3]-x;           
                ctx.font = 18;
                var txt = res.class_names[i];
                var width = ctx.measureText(txt).width;
                ctx.fillStyle = 'red';
                ctx.fillRect(x-1, y-13, width+2, 12);
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'black';
                ctx.fillText(txt, x, y-12);


                //select.options[select.options.length] = new Option(txt, i);
            }
            ctx.stroke();
        }).fail(function(){
            console.log("upload fail");
        });
         
         
    });

    $('#Clear').click(function(){
        remove = [];
        var cvs = document.getElementById('removecvs');
        var ctx = cvs.getContext("2d");
        ctx.clearRect(0, 0, cvs.width, cvs.height);
    });

    

    $('#removecvs').on('mousedown', function(e) {
        var canvasx = $('#removecvs').offset().left;
        var canvasy = $('#removecvs').offset().top;
        last_mousex = parseInt(e.clientX-canvasx);
        last_mousey = parseInt(e.clientY-canvasy);
        mousedown = true;
    });

    $('#removecvs').on('mouseup', function(e) {
        remove.push([last_mousey, last_mousex, mousey-last_mousey, mousex-last_mousex]);
        alert(remove);
        console.log(remove);
        mousedown = false;
    });

    $('#removecvs').on('mousemove', function(e) {
        var cvs = document.getElementById('removecvs');
        var canvasx = $('#removecvs').offset().left;
        var canvasy = $('#removecvs').offset().top;
        var ctx = cvs.getContext('2d');
        mousex = parseInt(e.clientX-canvasx);
        mousey = parseInt(e.clientY-canvasy);
        if(mousedown) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);

            ctx.beginPath();
            var width = mousex-last_mousex;
            var height = mousey-last_mousey;
            ctx.rect(last_mousex,last_mousey,width,height);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;

            for (var i = 0; i < remove.length; i++) { 
                ctx.rect(remove[i][1],remove[i][0],remove[i][3],remove[i][2]);
            }

            ctx.stroke();
        }
    });
           

});