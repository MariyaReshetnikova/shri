/**
	* Реализация API, не изменяйте ее
	* @param {string} url
	* @param {function} callback
	*/
	function getData(url, callback) {
	var RESPONSES = {
	'/countries': [
	{name: 'Cameroon', continent: 'Africa'},
	{name :'Fiji Islands', continent: 'Oceania'},
	{name: 'Guatemala', continent: 'North America'},
	{name: 'Japan', continent: 'Asia'},
	{name: 'Yugoslavia', continent: 'Europe'},
	{name: 'Tanzania', continent: 'Africa'}
	],
	'/cities': [
	{name: 'Bamenda', country: 'Cameroon'},
	{name: 'Suva', country: 'Fiji Islands'},
	{name: 'Quetzaltenango', country: 'Guatemala'},
	{name: 'Osaka', country: 'Japan'},
	{name: 'Subotica', country: 'Yugoslavia'},
	{name: 'Zanzibar', country: 'Tanzania'},
	],
	'/populations': [
	{count: 138000, name: 'Bamenda'},
	{count: 77366, name: 'Suva'},
	{count: 90801, name: 'Quetzaltenango'},
	{count: 2595674, name: 'Osaka'},
	{count: 100386, name: 'Subotica'},
	{count: 157634, name: 'Zanzibar'}
	]
	};
	
	setTimeout(function () {
	var result = RESPONSES[url];
	if (!result) {
	return callback('Unknown url');
	}
	
	callback(null, result);
	}, Math.round(Math.random * 1000));
	}
	
	/**
	* В заданном цикле не происходит сохранение результатов предыдущей итерации. 
	* Необъятный callback пытается вычислить значения по всем трем URL не дожидаясь ответа предыдушего запроса. 
	* Таким образом, я решила поставить счетчик ответов по всем трем url. 
	* Вначале следует главный цикл по requests, нашим URL. 
	* По каждому URL-request вызывается callback, который сохраняет резутат для каждого. 
	* После получения всех ответов, происходит вычисление результата.
	*/
	
	var requests = ['/countries', '/cities', '/populations'];
	var responses = {};
	
	
	//подсчет населения в городе 
	var countinCity = function(city) {
		var populations=[];
		var co=0;

	responses['/populations'].forEach(function(cit) {
		if (cit.name == city){
				populations[populations.length]=cit;
			}
		});
		
	if (populations.length>0) {
			populations.forEach(function(city){
				co=co+city.count;
			});
			return co;
		}
	else
		{
			return 0;
		}
	}
	//cчитаем рекурсивно население в стране
	var countinCountry = function(country) {
	var cities=[];
	var con=0;
	
	responses['/cities'].forEach(function(city) { 
		if (city.country == country){
				cities[cities.length]=city;
			}
		});
		//в массиве объектов, где страна города подходит к заданному значению 
		// считаем  население в городах
	if (cities.length>0) {
			cities.forEach(function(city){
				con=con+countinCity(city.name);
			});
		return con;
		}
	else
		{
			return 0;
		}
	}
	
	//счетчик требуемой Африки
	var countAfrica = function() {
	var contries=[];
	var coun=0;
	responses['/countries'].forEach(function(country) {
		if (country.continent == 'Africa'){
			contries[contries.length]=country; //Запоминаем страны с нашим континентом
		}
	});
	contries.forEach(function(counry){
		coun=coun+countinCountry(counry.name);  //Считаем население в каждой найденной стране
	});
	return coun;
	}; 
	
	var countAll = function(search) {
	var count = 0;
	if (rightcity(search)) { //ищем вводимое значение среди городов
		count = countinCity(search); //если город найден с таким именем, считаем его популяцию
	}
	else if (rightcountry(search)) { //не город, ищем в странах
		count = countinCountry(search); //если страна найдена с таким именем, считаем ее популяцию
	};
	
	if (count!=0) {
			console.log('Население ' + search + ' равно ' + count);
		}
	else {
		console.log('Вы ввели неверное значение');
			}
	return count;
	};
	
	//образование массива подходящих стран
	var rightcountry = function(search) {
		var countries =[];
		responses['/countries'].forEach(function(country){
			if (country.name == search){
				countries[countries.length] =country;
			}
		});
		if (countries.length>0){
			return true;
		}else{
			return false;
		}
	};
		
	//образование массива подходящих городов
	var rightcity = function(search) {
		var cities =[];
		responses['/cities'].forEach(function(city){
			if (city.name == search){
				cities[countries.length] =city;
			}
		});
		if (cities.length>0){
			return true;
		}else{
			return false;
		}
	}

	//проход по массиву URL requests и сбор результатов с каждого запроса
	requests.forEach(function(request) {
		var callback = function(error, result) {
			responses[request] = result; //кэширование результата
			var respkey, resplength = 0;
			//счетчик обработанных запросов
			for (respkey in responses) {
			++resplength;
			}
			// все ответы получены
			if (resplength === requests.length) {
			console.log('Суммарная популяция в Африкеt = ' + countAfrica());
			var place = prompt('Введите населенный пункт, численность населения которого желаете узнать:'),
			count = countAll(place);
			}
		};
	getData(request, callback);
	});