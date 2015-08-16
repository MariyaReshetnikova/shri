$(document).ready(function() {
	var context = new (window.AudioContext || window.webkitAudioContext)();
	
	window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function(callback, element){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
	
	// Проверка поддержки браузером
    if (typeof(window.FileReader) == 'undefined') {
        dropZone.text('Не поддерживается браузером!');
        dropZone.addClass('error');
    }
	
	var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
	var source, buffer, analyser, javascript, amplitudeArray; 
    var sampleSize = 1024;
	var canvasWidth  = 512;
    var canvasHeight = 256;
	var load=false; //проверка загрузки
	var paused=false; //проверка паузы
	var startedAt, pausedAt; //момент паузы
	var dropZone = $('#dropZone'); 
	var canvas= $("#canvas").get()[0];
	var ctx = canvas.getContext("2d");
	var inputs = [];
	var filters=createFilters();
	
	createInput(); //создаем DOM-слайдеры для ввода-вывода значения эквалайзера
	initInputs();  //добавляем базовые параметры
	
	
	//получаем элементы со страницы
	
	var pauseAudio = document.getElementById('pauseAudio'),
		stopAudio = document.getElementById('stopAudio'),
		playAudio = document.getElementById('playAudio'),
		files = document.getElementById('file');
	  
	//добавляем события
	
	files.addEventListener('change', loadMusic, false);
	stopAudio.addEventListener('click', stopSound, false);
	pauseAudio.addEventListener('click', pauseSound, false);
	playAudio.addEventListener('click', playSound, false);
	
	

/* Выполнение пункта 1. Открытие файлов с локального диска */

	function loadMusic(e){
		 $("#playAudio").css("visibility", "hidden");
		e.stopPropagation();
		event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');
        
    var droppedFiles = e.target.files || e.dataTransfer.files;
    var reader = new FileReader();

    reader.onload = function(e) {
		var data =this.result;
		stopSound(); 															//останавливаем источник, в случае загрузки во время воспроизведения другой композиции
		if (context.decodeAudioData) { 											//декодируем файл
			context.decodeAudioData(data, onBufferLoad, onBufferError);
		} 
		//Выполнение пункта 4. Вывод названия проигрываемого файла. Метаданные, если они существуют, перекрывают название
		dropZone.text(droppedFiles[0].name); 
		readMetadata(data);
    };
    
    reader.readAsArrayBuffer(droppedFiles[0]);
  }
  
  
  /* Выполнение пункта 2. Поддержка  drag'n'drop */
		
	// При наведении добавляем hover свечение
    dropZone[0].ondragover = function() {
        dropZone.addClass('hover');
        return false;
    };
    
    // При удалении курсора убираем
    dropZone[0].ondragleave = function() {
        dropZone.removeClass('hover');
        return false;
    }; 
	
	dropZone[0].ondrop =function(e) {
		 $("#playAudio").css("visibility", "hidden");
		e.stopPropagation();
		event.preventDefault();
        dropZone.removeClass('hover');
        dropZone.addClass('drop');
        
	
    var droppedFiles = e.target.files || e.dataTransfer.files;
    var reader = new FileReader();

    reader.onload = function(e) {
		var data =this.result;
		stopSound(); 															//останавливаем источник, в случае загрузки во время воспроизведения другой композиции
		if (context.decodeAudioData) { 											//декодируем файл
			context.decodeAudioData(data, onBufferLoad, onBufferError);
		} 
		dropZone.text(droppedFiles[0].name);
		readMetadata(data);

    };
    
    reader.readAsArrayBuffer(droppedFiles[0]);

  };

	
  /* Выполнение пункта 3. Кнопки play и stop */
  /* Также добавила pause, из-за этого пришлось существенно доработать play */
  
  function playSound() {
	 if ((load)&&(paused===false)) //если нажата пауза и произведение было загружено
	{	
		paused=true;
		source = context.createBufferSource(); //создаем источник 
		analyser  = context.createAnalyser();	//создаем анализатор 
		javascript = context.createScriptProcessor(sampleSize, 1, 1); //обработка звукового контекста с использованием js
		amplitudeArray = new Uint8Array(analyser.frequencyBinCount); //создаем массив частотных и временных параметров

        source.connect(analyser); //источник соединяем с анализатором
        analyser.connect(javascript); //анализатор с js обработкой
        javascript.connect(context.destination); //js подаем на вывод
		source.connect(context.destination); //источник присоединяем к выводу
		
		source.buffer = buffer; //подключаем буфер к источнику
		equalize(); 			//создаем эквалайзер
		
		javascript.onaudioprocess = setInterval(function(){
                analyser.getByteTimeDomainData(amplitudeArray); //получаем данные от анализатора
				drawVis(); //смотрим, что нарисовать
            }, 70); //ликвидация ""ряби"
			
    if (pausedAt) { //была пауза
		startedAt = Date.now() - pausedAt; //сохраняем новое начало воспроизведение, как результат 
		source.start(0, pausedAt / 1000);
		}
    else {
		startedAt = Date.now(); //паузы не было, сохраняем самое начало воспроизведения 
		source.start(0);
		}
	}
	else
	{
		 dropZone.text('Загрузите композицию!');
                dropZone.addClass('error');
	} 
};

function stopSound() { //полная остановка композиции, проигрывание с самого начала
  if (paused) {
	paused=false; 
	source.stop();
	pausedAt=0; 
	startedAt=0;
  }
};

function pauseSound() {
	if (paused){
		paused=false;
		source.stop();
			if (startedAt){
					pausedAt = Date.now() - startedAt;
					}
					else{
						dropZone.text("You paused unplaing song");
					}   
			}
				else
					 {
						  dropZone.text("You repeat pause");
					 }
	};
	
	
//при успешном получении декодированного буфера
function onBufferLoad(b) { 
	load=true; //разрешаем воспроизведение
	buffer=b; 
	$("#playAudio").css("visibility", "visible"); //даем пользователю кнопку

};
//при ошибке ругаемся
function onBufferError(e) {
	console.log('onBufferError', e);
	dropZone.text('Произошла ошибка!');
	dropZone.addClass('error'); 
};

//к каждому фильтру привязываем слайдер для ввода значения
function filtersaddListener(){
[].forEach.call(inputs, function (item, i) {
	  item.addEventListener('change', function (e) {
      filters[i].gain.value = e.target.value;
    }, false);
    });
}

/* source.onended = function() { //отслеживаем событие окончания воспроизведения
		if (source){
		dropZone.text("Конец воспроизведения");
		loadMusic();
		}
	}; */
	

/* 	Выполнение пункта 1.5. Создание вариантов визуализации */

//селектор выбора визуализатора
function drawVis(){
	var visal=$("#select_visual option:selected").val();
	if (visal==10){
		 requestAnimFrame(drawWafe);
	}
	if (visal==20){
		 requestAnimFrame(drawBlue);
	}
	if (visal==30){
		 requestAnimFrame(drawCircl);
	}
};

//кружки
 function drawCircl() {
				ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			for (var i = 0; i < amplitudeArray.length; i=i+40)
				{   
					var value = amplitudeArray[i] / 256;
					var y = canvasHeight - (canvasHeight * value) - 1; 
					ctx.beginPath();
					ctx.arc(i, y, 20,0,2*Math.PI, true);
					ctx.fillStyle='#ee432e';
					ctx.fill();
				} 
		}	 

//spectrum
function drawBlue() {
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		for (var i = 0; i < amplitudeArray.length; i=i+3) 
			{
				var value = amplitudeArray[i];
				var gradient = ctx.createLinearGradient(0,0,0,canvas.height);
				gradient.addColorStop(1,'#00ccff');
				gradient.addColorStop(0.75,'#0066cc');
				gradient.addColorStop(0.25,'#cccccc');
				gradient.addColorStop(0,'#cc6600');
				ctx.fillStyle = gradient;
				ctx.fillRect(i*5,canvasHeight-value,10,canvasHeight);
			 } 	 
		} 
		
//waveform
	function drawWafe() {
     ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			  for (var i = 0; i < amplitudeArray.length; i++) {
					var value = amplitudeArray[i] / 256;
					var y = canvasHeight - (canvasHeight * value) - 1;
					ctx.fillStyle = '#ffffff';
					ctx.fillRect(i, y, 1, 1);
        }
	}		
	
	
/* 	Выполнение пункта 2.1. Выбор настроек эквалайзера */

$("#select_equalizer").on('change', function(){
	//alert(this.value);
	var eq=$("#select_equalizer option:selected").val();
	switch(eq){
		case "5": 
			popsa(); 
			break
		case "2": 
			rock() 
			break
		case "3": 
			jazz() 
			break
		case "4": 
			classic() 
			break
		case "1": 
			normal() 
			break
		default:
			console.log("error");
}
});

//создание Input`ов для настроек эквалайзера

function createInput(){  
		for (var k = 0; k < 10; k++) {
			var inp="<input class='filter'></input>";
			$("#filters").append(inp);
			$("#filters").append("<span>"+frequencies[k]+"</span>");
			if (k==4){
				$("#filters").append('<br>');
			} 
		}
	inputs=$(".filter");
	};
	
 function initInputs() {
    [].forEach.call(inputs, function (item) {
      item.setAttribute('min', -16);
      item.setAttribute('max', 16);
      item.setAttribute('step', 0.1);
	  item.setAttribute('orientation', 'hori');
      item.setAttribute('value', 0);
      item.setAttribute('type', 'range');
	
    });
  };
  
 
//создание эквалайзера

function createFilter(frequency) {
	  var filter = context.createBiquadFilter();
	  filter.type = 'peaking'; // тип фильтра
	  filter.frequency.value = frequency; // частота
	  filter.Q.value = 1; // Q-factor
	  filter.gain.value = 0;
return filter;
};

function createFilters() {
    filters = frequencies.map(createFilter);
	filters.reduce(function (prev, curr) {
    prev.connect(curr);
    return curr;
  });
  return filters;
};


function equalize() {
  // присоединяем источник к 1 фильтру, последний фильтр к выходу
  source.connect(filters[0]);
  console.log(filters[0].gain.value);
  filters[filters.length - 1].connect(context.destination);
  console.log(filters[filters.length - 1].gain.value);
};

/* 	свойства режимов эквалайзера. на глаз из эквалайзера Winamp */

	function popsa(){
	 inputs[0].value=0;
	filters[0].gain.value=0;
	 	inputs[1].value=3;
	 filters[1].gain.value=3;
		inputs[2].value=6;
	filters[2].gain.value=6;
		inputs[3].value=8;
	filters[3].gain.value=8;
		inputs[4].value=6;
	filters[4].gain.value=6;
		inputs[5].value=-3;
	filters[5].gain.value=-3;
		inputs[6].value=-6;
	filters[6].gain.value=-6;
		inputs[7].value=-6;
	filters[7].gain.value=-6;
		inputs[8].value=-6;
	filters[8].gain.value=-6;
		inputs[9].value=-6;
	filters[9].gain.value=-6;
	 
 };
 
 function rock(){
	 inputs[0].value=6;
	filters[0].gain.value=6;
	 	inputs[1].value=4;
	 filters[1].gain.value=4;
		inputs[2].value=-4;
	filters[2].gain.value=-4;
		inputs[3].value=-8;
	filters[3].gain.value=-8;
		inputs[4].value=-4;
	filters[4].gain.value=-4;
		inputs[5].value=4;
	filters[5].gain.value=4;
		inputs[6].value=7;
	filters[6].gain.value=7;
		inputs[7].value=10;
	filters[7].gain.value=10;
		inputs[8].value=10;
	filters[8].gain.value=10;
		inputs[9].value=10;
	filters[9].gain.value=10;
	 
 };
 
  function jazz(){
		inputs[0].value=-2;
	filters[0].gain.value=-2;
	 	inputs[1].value=8;
	 filters[1].gain.value=8;
		inputs[2].value=-10;
	filters[2].gain.value=-10;
		inputs[3].value=2;
	filters[3].gain.value=2;
		inputs[4].value=10;
	filters[4].gain.value=10;
		inputs[5].value=9;
	filters[5].gain.value=9;
		inputs[6].value=8;
	filters[6].gain.value=8;
		inputs[7].value=2;
	filters[7].gain.value=2;
		inputs[8].value=2;
	filters[8].gain.value=2;
		inputs[9].value=2;
	filters[9].gain.value=2;
	 
 };
   function normal(){
		inputs[0].value=0;
	filters[0].gain.value=0;
	 	inputs[1].value=0;
	 filters[1].gain.value=0;
		inputs[2].value=0;
	filters[2].gain.value=-0;
		inputs[3].value=0;
	filters[3].gain.value=0;
		inputs[4].value=0;
	filters[4].gain.value=0;
		inputs[5].value=0;
	filters[5].gain.value=0;
		inputs[6].value=0;
	filters[6].gain.value=0;
		inputs[7].value=0;
	filters[7].gain.value=0;
		inputs[8].value=0;
	filters[8].gain.value=0;
		inputs[9].value=0;
	filters[9].gain.value=0;
	 
 };
 function classic(){
		inputs[0].value=0;
	filters[0].gain.value=0;
	 	inputs[1].value=0;
	 filters[1].gain.value=0;
		inputs[2].value=0;
	filters[2].gain.value=-0;
		inputs[3].value=0;
	filters[3].gain.value=0;
		inputs[4].value=0;
	filters[4].gain.value=0;
		inputs[5].value=0;
	filters[5].gain.value=0;
		inputs[6].value=-6;
	filters[6].gain.value=-6;
		inputs[7].value=-6;
	filters[7].gain.value=-6;
		inputs[8].value=-6;
	filters[8].gain.value=-6;
		inputs[9].value=-7;
	filters[9].gain.value=-7;
	 
 };
	
		
/* 	Выполнение пункта 2.2. Вывод названия песни и исполнителя из метаданных
	Позаимствовано с http://ericbidelman.tumblr.com/post/8343485440/reading-mp3-id3-tags-in-javascript */
	
	function readMetadata(data){ 
	var dv = new jDataView(data);
      if (dv.getString(3, dv.byteLength - 128) == 'TAG') {
			var title = dv.getString(30, dv.tell());
			var artist = dv.getString(30, dv.tell());
			var album = dv.getString(30, dv.tell());
			var year = dv.getString(4, dv.tell());
			 dropZone.text( 'Playing "' + title + '" by ' + artist);
      }
	}
	
});