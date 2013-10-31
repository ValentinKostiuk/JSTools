document.write('<link rel="stylesheet" type="text/css" href="style.css" />');//так как в хеде, по условию подключить стили нельзя делаем их так

window.onload = function (){//при готовности выполняем функцию
	var z_count;
	//здесь будем хранить номер слоя для блоков
	z_count = 0;
	//////////////////////////////////////раздел вспомогательных функций/////////////////////////////////////////////////
	//функция для получения размеров видимой области документа
	function get_viewport_size(w){
		var d;
		//использовать указанное окно или текущее
		w = w || window;
		//для всех кроме ИЕ8 и старше
		if(w.innerWidth != null) {
			return {
				w: w.innerWidth,
				h: w.innerHeight
			};
		}
		//для ИЕ и других в стандартном режиме
		d = w.document;
		if (document.compatMode === 'CSS1Compat'){
			return{
				w: d.documentElement.clientWidth,
				h: d.documentElement.clientHeight
			};
		}
		//для броузеров в режиме совместимости
		return{
			w: d.body.clientWidth,
			h: d.body.clientHeight
		};
	}

	//функция получения позиции полос прокрутки
	function get_scroll_offsets(w){
		w = w || window;
		//для всех кроме ИЕ
		if (w.pageXOffset != null){
			return {
				x: w.pageXOffset,
				y: w.pageYOffset
			};
		}
		//для ИЕ и других броузеров в стандартном режиме
		var d = w.document;
		if (document.compatMode === 'CSS1Compat'){
			return{
				x: d.documentElement.scrollLeft,
				y: d.documentElement.scrollTop
			};
		}
		//для броузеров в режиме совместимости
		return{
			x: d.body.scrollLeft,
			y: d.body.scrollTop
		};
	}
	///////////////////////////////конец раздела вспомогательных функций/////////////////////////////////////////////////

	//здесь мы добавляем панельку с кнопками наврядли innerHTML сильно повлияет на быстродействие
	document.body.innerHTML = '<div id = "panel"><input type = "button" value = "Add" id = "add"/><input type = "button" value = "Clear" id = "clear" /></div>';

	//функция добавляет новый блок
	function add_new_block(){
		var block_wrapper,
			block,
			tl_resizer,
			tr_resizer,
			br_resizer,
			bl_resizer,
			viewport_size;
		viewport_size = get_viewport_size();//определим размер видимой области
		block_wrapper = document.createElement('div');//создаем враппер блока
		block_wrapper.className = 'block_wrapper';//применим стили по умолчанию
		block_wrapper.style.position = 'absolute';
		block_wrapper.style.width = '150px';//зададим высоту и ширину
		block_wrapper.style.height = '150px';
		block_wrapper.style.top = viewport_size.h/2 - 75 + 'px';//вычислим положения блока
		block_wrapper.style.left = viewport_size.w/2 - 75 + 'px';//вставляем в середину вьюпорта
		block_wrapper.style.zIndex = z_count;//правильный слой
		block = document.createElement('div');//суда можно поместить контент
		block.className = 'block';//стили поумолчанию
		tl_resizer = document.createElement('div');//верхняя левая тянучка
		tl_resizer.className = 'tl_resizer';//стили поумолчанию для тянучек
		tl_resizer.style.zIndex = z_count + 1;//на один слой выше родителя
		tr_resizer = document.createElement('div');//верхняя правая тянучка
		tr_resizer.className = 'tr_resizer';//стили поумолчанию для тянучек
		tr_resizer.style.zIndex = z_count + 1;//на один слой выше родителя
		br_resizer = document.createElement('div');//нижняя правая тянучка
		br_resizer.className = 'br_resizer';//стили поумолчанию для тянучек
		br_resizer.style.zIndex = z_count + 1;//на один слой выше родителя
		bl_resizer = document.createElement('div');//нижняя левая тянучка
		bl_resizer.className = 'bl_resizer';//стили поумолчанию для тянучек
		bl_resizer.style.zIndex = z_count + 1;//на один слой выше родителя
		block_wrapper.appendChild(block);//добавляем блок во враппер
		block_wrapper.appendChild(tl_resizer);//добавляем тянучки во враппер
		block_wrapper.appendChild(tr_resizer);
		block_wrapper.appendChild(br_resizer);
		block_wrapper.appendChild(bl_resizer);
		document.body.appendChild(block_wrapper);//добавляем враппер в боди
		z_count += 2;//наращиваем слой для последующих добавляемых блоков
	}

	//функция удаления блоков
	function remove_blocks(){
		var blocks,
			i;
		blocks = document.querySelectorAll('.block_wrapper');//отыскиваем все блоки, такая выборка дает мертвую коллекцию
		for(i = 0; i < blocks.length; i += 1){
			blocks[i].parentNode.removeChild(blocks[i]);//валим блоки по очереди
		}
		z_count = 0;//сбрасываем счетчик блоков
	}


	//функция перетаскивания блоков
	function drag(event){
		event = event || window.event;//правильно определяем объект события
		if (!event.target && event.srcElement) {//правильно определяем элемент на котором произошло событие
			event.target = event.srcElement;
		}
		if(event.target.className !=='block'){//так как навешивать обработчик будем делегированием
			return;//проверяем на том ли элементе произошло событие, нет выходим
		}
		var element_to_drag,
			start_x,
			start_y,
			scroll,
			origin_x,
			origin_y,
			delta_x,
			delta_y;
		element_to_drag = event.target.parentNode;//перетаскивать будем родителя так как именно у него абсолютное позиционирование
		scroll = get_scroll_offsets();//получаем полосы прокрутки
		start_x = event.clientX + scroll.x;//сохраняем координаты начала перетаскивания
		start_y = event.clientY + scroll.y;
		//запоминаем первоначальные координаты элемента относительно документа
		origin_x = element_to_drag.offsetLeft;
		origin_y = element_to_drag.offsetTop;
		//точкой начала перетаскивания и верхним левым углом нашего элемента
		delta_x = start_x - origin_x;
		delta_y = start_y - origin_y;
		//этот обработчик перехватывает событие передвижения мыши, он отвечает за перемещение элемента
		function move_handler(e){
			e = e || window.event;//правильно определяем объект события
			var scroll;
			scroll = get_scroll_offsets();
			element_to_drag.style.left = (e.clientX + scroll.x - delta_x) + 'px';
			element_to_drag.style.top = (e.clientY + scroll.y - delta_y) + 'px';
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//этот обработчик перехватывае событие moseup  тоесть отвечает за конец перетаскивания элемента
		function up_handler(e){
			e = e || window.event;//правильно определяем объект события
			//удалить перехватывающие обработчики
			if(document.removeEventListener){//стандартная модель событий
				document.removeEventListener('mouseup', up_handler, true);
				document.removeEventListener('mousemove', move_handler, true);
			}else if(document.detachEvent){//специально для любимого ИЕ
				element_to_drag.detachEvent('onlosecapture', up_handler);
				element_to_drag.detachEvent('onmouseup', up_handler);
				element_to_drag.detachEvent('onmousemove', move_handler);
				element_to_drag.releaseCapture();
			}
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//далее регистрируем обработчики событий движения мыши и отпускания элемента
		if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousemove', move_handler, true);
			document.addEventListener('mouseup', up_handler, true);
		}else if(document.attachEvent){//модель событий ИЕ5-8
			//модели ИЕ перехват события осуществляется с помощью метода setCapture() самого элемента
			element_to_drag.setCapture();
			element_to_drag.attachEvent('onmousemove', move_handler);
			element_to_drag.attachEvent('onmouseup', up_handler);
			//потеря перехвата событий интерпретируем как mouseup
			element_to_drag.attachEvent('onlosecapture', up_handler);
		}
		// это событие обработано и не должно передаватся по дереву
		//на всяк случай предотвратим выполнение действий по умолчанию
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}

	//////////далее реализуем изменение размеров элемента
	function br_resize (event){//обработчик для тянучки нижнего правого угла элемента
		event = event || window.event;//правильно определяем объект события
		if (!event.target && event.srcElement) {//правильно определяем элемент на котором произошло событие
			event.target = event.srcElement;
		}
		if(event.target.className !=='br_resizer'){//так как навешивать обработчик будем делегированием
			return;//проверяем на том ли элементе произошло событие, нет выходим
		}
		var element_to_resize,
			start_x,
			start_y,
			width,
			height;
		element_to_resize = event.target.parentNode;//менять размер будем у родителя так как именно у него абсолютное позиционирование
		width = parseFloat(element_to_resize.style.width);//так получаем размеры элемента)
		height = parseFloat(element_to_resize.style.height);
		start_x = event.clientX;//запомним координаты события
		start_y = event.clientY;

		function move_handler(e){//изменеие размера элемента
			e = e || window.event;//правильно определяем объект события
			if((width + e.clientX - start_x) < 7){//чтобы элемент не исчезал совсем
				return;
			}
			if((height + e.clientY - start_y) < 7){
				return;
			}
			element_to_resize.style.width = width + e.clientX - start_x + 'px';
			element_to_resize.style.height = height + e.clientY - start_y + 'px';
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//этот обработчик перехватывае событие moseup  тоесть отвечает за конец ресайза
		function up_handler(e){
			e = e || window.event;//правильно определяем объект события
			//удалить перехватывающие обработчики
			if(document.removeEventListener){//стандартная модель событий
				document.removeEventListener('mouseup', up_handler, true);
				document.removeEventListener('mousemove', move_handler, true);
			}else if(document.detachEvent){//специально для любимого ИЕ
				element_to_resize.detachEvent('onlosecapture', up_handler);
				element_to_resize.detachEvent('onmouseup', up_handler);
				element_to_resize.detachEvent('onmousemove', move_handler);
				element_to_resize.releaseCapture();
			}
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//далее регистрируем обработчики событий движения мыши и отпускания элемента
		if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousemove', move_handler, true);
			document.addEventListener('mouseup', up_handler, true);
		}else if(document.attachEvent){//модель событий ИЕ5-8
			//модели ИЕ перехват события осуществляется с помощью метода setCapture() самого элемента
			element_to_resize.setCapture();
			element_to_resize.attachEvent('onmousemove', move_handler);
			element_to_resize.attachEvent('onmouseup', up_handler);
			//потеря перехвата событий интерпретируем как mouseup
			element_to_resize.attachEvent('onlosecapture', up_handler);
		}
		// это событие обработано и не должно передаватся по дереву
		//на всяк случай предотвратим выполнение действий по умолчанию
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}

	function tr_resize (event){//обработчик для тянучки верхнего правого угла элемента
		event = event || window.event;//правильно определяем объект события
		if (!event.target && event.srcElement) {//правильно определяем элемент на котором произошло событие
			event.target = event.srcElement;
		}
		if(event.target.className !=='tr_resizer'){//так как навешивать обработчик будем делегированием
			return;//проверяем на том ли элементе произошло событие, нет выходим
		}
		var element_to_resize,
			start_x,
			start_y,
			width,
			height,
			top;
		element_to_resize = event.target.parentNode;//менять размер будем у родителя так как именно у него абсолютное позиционирование
		width = parseFloat(element_to_resize.style.width);
		height = parseFloat(element_to_resize.style.height);
		top = parseFloat(element_to_resize.style.top);
		start_x = event.clientX;//запомним координаты события
		start_y = event.clientY;

		function move_handler(e){//изменеие размера элемента
			e = e || window.event;//правильно определяем объект события
			if((width + e.clientX - start_x) < 7){//чтобы элемент не исчезал совсем
				return;
			}
			if((height + start_y - e.clientY) < 7){
				return;
			}
			element_to_resize.style.width = width + e.clientX - start_x + 'px';
			element_to_resize.style.height = height + start_y - e.clientY + 'px';
			element_to_resize.style.top = top + e.clientY - start_y + 'px';
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//этот обработчик перехватывае событие moseup  тоесть отвечает за конец ресайза элемента
		function up_handler(e){
			e = e || window.event;//правильно определяем объект события
			//удалить перехватывающие обработчики
			if(document.removeEventListener){//стандартная модель событий
				document.removeEventListener('mouseup', up_handler, true);
				document.removeEventListener('mousemove', move_handler, true);
			}else if(document.detachEvent){//специально для любимого ИЕ
				element_to_resize.detachEvent('onlosecapture', up_handler);
				element_to_resize.detachEvent('onmouseup', up_handler);
				element_to_resize.detachEvent('onmousemove', move_handler);
				element_to_resize.releaseCapture();
			}
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//далее регистрируем обработчики событий движения мыши и отпускания элемента
		if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousemove', move_handler, true);
			document.addEventListener('mouseup', up_handler, true);
		}else if(document.attachEvent){//модель событий ИЕ5-8
			//модели ИЕ перехват события осуществляется с помощью метода setCapture() самого элемента
			element_to_resize.setCapture();
			element_to_resize.attachEvent('onmousemove', move_handler);
			element_to_resize.attachEvent('onmouseup', up_handler);
			//потеря перехвата событий интерпретируем как mouseup
			element_to_resize.attachEvent('onlosecapture', up_handler);
		}
		// это событие обработано и не должно передаватся по дереву
		//на всяк случай предотвратим выполнение действий по умолчанию
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}

	function tl_resize (event){//обработчик для тянучки верхнего левого угла элемента
		event = event || window.event;//правильно определяем объект события
		if (!event.target && event.srcElement) {//правильно определяем элемент на котором произошло событие
			event.target = event.srcElement;
		}
		if(event.target.className !=='tl_resizer'){//так как навешивать обработчик будем делегированием
			return;//проверяем на том ли элементе произошло событие, нет выходим
		}
		var element_to_resize,
			start_x,
			start_y,
			width,
			height,
			top,
			left;
		element_to_resize = event.target.parentNode;//менять размер будем у родителя так как именно у него абсолютное позиционирование
		width = parseFloat(element_to_resize.style.width);
		height = parseFloat(element_to_resize.style.height);
		top = parseFloat(element_to_resize.style.top);
		left = parseFloat(element_to_resize.style.left);
		start_x = event.clientX;//запомним координаты события
		start_y = event.clientY;

		function move_handler(e){//изменеие размера элемента
			e = e || window.event;//правильно определяем объект события
			if((width + start_x - e.clientX) < 7){//чтобы элемент не исчезал совсем
				return;
			}
			if((height + start_y - e.clientY) < 7){
				return;
			}
			element_to_resize.style.width = width + start_x - e.clientX + 'px';
			element_to_resize.style.height = height + start_y - e.clientY + 'px';
			element_to_resize.style.top = top + e.clientY - start_y + 'px';
			element_to_resize.style.left = left + e.clientX - start_x + 'px';
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//этот обработчик перехватывае событие moseup  тоесть отвечает за конец ресайза элемента
		function up_handler(e){
			e = e || window.event;//правильно определяем объект события
			//удалить перехватывающие обработчики
			if(document.removeEventListener){//стандартная модель событий
				document.removeEventListener('mouseup', up_handler, true);
				document.removeEventListener('mousemove', move_handler, true);
			}else if(document.detachEvent){//специально для любимого ИЕ
				element_to_resize.detachEvent('onlosecapture', up_handler);
				element_to_resize.detachEvent('onmouseup', up_handler);
				element_to_resize.detachEvent('onmousemove', move_handler);
				element_to_resize.releaseCapture();
			}
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//далее регистрируем обработчики событий движения мыши и отпускания элемента
		if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousemove', move_handler, true);
			document.addEventListener('mouseup', up_handler, true);
		}else if(document.attachEvent){//модель событий ИЕ5-8
			//модели ИЕ перехват события осуществляется с помощью метода setCapture() самого элемента
			element_to_resize.setCapture();
			element_to_resize.attachEvent('onmousemove', move_handler);
			element_to_resize.attachEvent('onmouseup', up_handler);
			//потеря перехвата событий интерпретируем как mouseup
			element_to_resize.attachEvent('onlosecapture', up_handler);
		}
		// это событие обработано и не должно передаватся по дереву
		//на всяк случай предотвратим выполнение действий по умолчанию
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}

	function bl_resize (event){//обработчик для тянучки нижнего левого угла элемента
		event = event || window.event;//правильно определяем объект события
		if (!event.target && event.srcElement) {//правильно определяем элемент на котором произошло событие
			event.target = event.srcElement;
		}
		if(event.target.className !=='bl_resizer'){//так как навешивать обработчик будем делегированием
			return;//проверяем на том ли элементе произошло событие, нет выходим
		}
		var element_to_resize,
			start_x,
			start_y,
			width,
			height,
			left;
		element_to_resize = event.target.parentNode;//менять размер будем у родителя так как именно у него абсолютное позиционирование
		width = parseFloat(element_to_resize.style.width);
		height = parseFloat(element_to_resize.style.height);
		left = parseFloat(element_to_resize.style.left);
		start_x = event.clientX;//запомним координаты события
		start_y = event.clientY;

		function move_handler(e){//изменеие размера элемента
			e = e || window.event;//правильно определяем объект события
			if((width + start_x - e.clientX) < 7){//чтобы элемент не исчезал совсем
				return;
			}
			if((height + e.clientY - start_y) < 7){
				return;
			}
			element_to_resize.style.width = width + start_x - e.clientX + 'px';
			element_to_resize.style.height = height + e.clientY - start_y + 'px';
			element_to_resize.style.left = left + e.clientX - start_x + 'px';
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//этот обработчик перехватывае событие moseup  тоесть отвечает за конец ресайза элемента
		function up_handler(e){
			e = e || window.event;//правильно определяем объект события
			//удалить перехватывающие обработчики
			if(document.removeEventListener){//стандартная модель событий
				document.removeEventListener('mouseup', up_handler, true);
				document.removeEventListener('mousemove', move_handler, true);
			}else if(document.detachEvent){//специально для любимого ИЕ
				element_to_resize.detachEvent('onlosecapture', up_handler);
				element_to_resize.detachEvent('onmouseup', up_handler);
				element_to_resize.detachEvent('onmousemove', move_handler);
				element_to_resize.releaseCapture();
			}
			if(event.stopPropagation){
				event.stopPropagation();
			}else{
				event.cancelBubble = true;
			}
		}
		//далее регистрируем обработчики событий движения мыши и отпускания элемента
		if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousemove', move_handler, true);
			document.addEventListener('mouseup', up_handler, true);
		}else if(document.attachEvent){//модель событий ИЕ5-8
			//модели ИЕ перехват события осуществляется с помощью метода setCapture() самого элемента
			element_to_resize.setCapture();
			element_to_resize.attachEvent('onmousemove', move_handler);
			element_to_resize.attachEvent('onmouseup', up_handler);
			//потеря перехвата событий интерпретируем как mouseup
			element_to_resize.attachEvent('onlosecapture', up_handler);
		}
		// это событие обработано и не должно передаватся по дереву
		//на всяк случай предотвратим выполнение действий по умолчанию
		if(event.stopPropagation){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	}

	///////здесь прибиндиваем обработчики к элементам//////////
	document.getElementById('add').onclick = add_new_block;//кнопка добавления блока, это наверное самый кроссбраузерный способ)))
	document.getElementById('clear').onclick = remove_blocks;//кнопка очистки
	if(document.addEventListener){//для стандартной модели событий, делегирование событий на родителя,
		//так не нужно добавлять к каждому новому элементу обработчик
			document.addEventListener('mousedown', drag, true);
	}else if(document.attachEvent){//модель событий ИЕ5-8
		document.attachEvent('onmousedown', drag);
	}
	if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousedown', br_resize, true);//для нижней правой тянучки
	}else if(document.attachEvent){//модель событий ИЕ5-8
		document.attachEvent('onmousedown', br_resize);
	}
	if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousedown', tr_resize, true);//для верхней правой тянучки
	}else if(document.attachEvent){//модель событий ИЕ5-8
		document.attachEvent('onmousedown', tr_resize);
	}
	if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousedown', tl_resize, true);//для верхней левой тянучки
	}else if(document.attachEvent){//модель событий ИЕ5-8
		document.attachEvent('onmousedown', tl_resize);
	}
	if(document.addEventListener){//для стандартной модели событий
			document.addEventListener('mousedown', bl_resize, true);//для нижней левой тянучки
	}else if(document.attachEvent){//модель событий ИЕ5-8
		document.attachEvent('onmousedown', bl_resize);
	}
};