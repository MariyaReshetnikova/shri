$(document).ready(function(){
	
	//ответы чекбоксов
		$("#out_check").change(function(){
			if ($("#out_check").prop("checked")){
				$(".out").css({'display':''});
				}
			else{
				$(".out").css({'display':'none'});
			}
		});
		
		$("#arrival_check").change(function(){
			if ($("#arrival_check").prop("checked")){
				$(".arr").css({'display':''});
				}
			else{
				$(".arr").css({'display':'none'});
				}
		});
		
	//изменение прозрачность и положения заголовка таблицы при изменении полосы прокрутки
	
	$(window).scroll(function(){ 
		var scrollTop = $(window).scrollTop();
		
		if(scrollTop > 79){	
			$('thead').css({'top':$(document).scrollTop() - 79});
			$('thead').stop().animate({'opacity':'0.2'},400);
					}
		else{
			$('thead').offset({top:78});
			$('thead').stop().animate({'opacity':'1'},400);
			}
		});
				

		$('thead').hover(
					function (e) { //изменение прозрачности при mouseenter
						var scrollTop = $(window).scrollTop();
						if(scrollTop != 0){
							$('thead').stop().animate({'opacity':'1'},400);
						}
						else{
							$('thead').stop().animate({'opacity':'1'},400);
						}
					},
					function (e) {  //изменение прозрачности при mouseleave	
						var scrollTop = $(window).scrollTop();
						if(scrollTop != 0){
							$('thead').stop().animate({'opacity':'0.2'},400);
						}
						else{
							$('thead').stop().animate({'opacity':'1'},400);
						}
					}
				);
	 
	 /* 
	 function getInfo(){
		$.ajax({
			url: "https://api.rasp.yandex.net/v1.0/schedule/ ?apikey={}&format=json&station={}&lang=ru&transport_types=plane&date={}",
			cache: false,
			dataType: "json",
			success:  function(json){
				if (json.schedule.length>0){
				//$(xml).find("schedule").each(function() {
					
					$.each(json.schedule, function(){
						var start='<tr class="arr" onclick="alert($(this).text())"><td><img src="arr_plane.png"></td><td> ';
						var number=this[]
						var company=
						var logocompany=
						var city=
						var arrtime=
						var deptime=
						random
						var status=
						random
						var comment=
					})
					 var info=start+number+company+logocompany+city+arrtime+deptime+status+comment;
					 $('table tbody').append(info);
				});
				getTime();
			}
		});
	} 
 	 getTime();
	function getTime(){
       $('#updatedTime').load("time.php");
    }
	  */	
	
});