function GoodsProc(){
	// 함수 돌리기 위한 폼
	this.goods_form_obj = '.goods-form'; // 리스트 폼
	this.goods_form_gname = '.gname'; // 상품명
	this.goods_form_opname = '.opname'; // 상품명
	this.goods_codi_form_obj = '.goods-codi-form';
	this.goods_ori_form = '.select-form'; // 초기화를 위한 폼
	this.goods_form_info = '.goods-form-info'; // 초기선택없을때의 상자

	// 다중옵션일시 초기화하는 객체와 클래스명
	this.removeClassObj = '.optSelect a';
	this.removeClassName = 'active';

	// 금액설정
	this.total_price_obj = '#total-price'; // 총 금액 선택자
	this.total_ea_obj = '#total-count'; // 총수량 선택자

	// 코디상품
	this.total_codi_price_obj = '#total-codi-price'; // 총 금액 선택자
	this.total_codi_ea_obj = '#total-codi-count'; // 총수량 선택자
	this.total_codi_price_dis_obj = '#total-codi-price-dis'; // 기간할인금액이 더해진 총액

	// 파일 경로
	this.classFileAddr = '/class/goods_ajax.php'; // 해당파일 위치

	// 기본 ajax 함수
	this.ajax = function(method,string){
		var data = $.ajax({
						url:this.classFileAddr,
						type:'post',
						data:{'method':method,'string':string},
						async:false,
						success:function(data){}
					}).responseText;
		if( data ){
			data = JSON.parse(data);
			return data;
		}
	}

	// 선택된 상품목록중 빈값이 있는지
	this.null_check = function(type){
		var nullCnt = 0;

		var obj = $(this.goods_form_obj).filter(':gt(0)');

		if( type == 'codi' ){
			obj = $(this.goods_codi_form_obj).filter(':visible');
		}

		if( obj.length <= 0 ){
			alert('상품을 선택해주세요');
			nullCnt++;
			return false;
		}

		if( type == 'codi' ){
			obj.each(function(e){
				// 코디 상품 체크해제되어 있으면 넘김
				if( $(this).find('.codiIsCheck').length > 0 && !$(this).find('.codiIsCheck').prop('checked') ){
					return true;
				}

				if( $(this).find('[name="op1"]').length && $(this).find('[name="op1"]').val() == '' ){
					alert('옵션을 선택해주세요');
					nullCnt++;
					return false;
				}

				if( $(this).find('[name="op2"]').length && $(this).find('[name="op2"]').val() == '' ){
					alert('옵션을 선택해주세요');
					nullCnt++;
					return false;
				}

				if( $(this).find('[name="ea"]').length && $(this).find('[name="op2"]').val() == '' ){
					alert('수량을 설정해주세요');
					nullCnt++;
					return false;
				}
			});
		}

		if( nullCnt > 0 ){
			return false;
		}else{
			return true;
		}
	}

	// 옵션선택 체크
	this.select_check = function(){
		var obj = $(event.target||event.srcElement).closest('form');

		if( !obj ){
			return true;
		}

		if( obj.find('[name="op1"]').length && obj.find('[name="op1"]').val() == '' ){
			return true;
		}

		if( obj.find('[name="op2"] option').length > 1 && obj.find('[name="op2"]').val() == '' ){
			return true;
		}

		if( obj.find('[name="ea"]').length && obj.find('[name="ea"]').val() == '' ){
			return true;
		}

		return false;
	}

	// 이미선택한 옵션인지
	this.opt_already = function(string) {
		var cnt = $(this.goods_form_obj).filter("[string-code='"+string+"']").length
		if( cnt > 0 ){
			return true;
		}else{
			return false;
		}
	}

	// 옵션복사
	this.opt_copy = function(string){
		/*
		ts2036 제품은 1 1 기획 상품입니다.
		하나 더 골라주셔야 구매가 가능해요~
		*/

		// 기본 복사영역
		var html = $(this.goods_form_obj).filter(':first').clone();

		// 세팅할 값
		var goods_obj = $(event.target||event.srcElement).closest('form').find('[name="goods_idx"]');
		var goods_idx = goods_obj.val();
		var gname = goods_obj.data('gname');
		var addGname = goods_obj.data('addgname');

		var op1_obj = $(event.target||event.srcElement).closest('form').find('[name="op1"] option:selected');
		var op2_obj = $(event.target||event.srcElement).closest('form').find('[name="op2"] option:selected');

		// 하나더할인 제한 있으면 경고창 띄움 2020-05-12
		if(op1_obj.data('ispluslimit') > 0 && $(this.goods_form_obj).length == 1 ){ // 처음 고를때만 알려줌
			alert(op1_obj.data('opcode')+" 제품은 1+1 기획 상품입니다.\n하나 더 골라주셔야 구매가 가능해요~");
		}

		var account = Number(op1_obj.data('account'));

		if( op2_obj.length > 0 ){
			account += Number(op2_obj.data('account'));
		}

		var op1 = op1_obj.val();
		var op2 = op2_obj.val();

		var op1name = op1_obj.data('opname');
		var op2name = op2_obj.data('opname');

		if( addGname ){
			op1name = addGname+' '+op1name;
		}

		var tmp_opname = new Array();

		if( $('select[name="gCode"]').length > 0 ){
			var tmp_code = gname.split(' ');
			tmp_opname.push(tmp_code[0]);
		}

		if( op1name ){
			tmp_opname.push(op1name);
		}
		if( op2name ){
			tmp_opname.push(op2name);
		}

		tmp_opname = tmp_opname.join(' / ');

		html.find(this.goods_form_gname).text(gname);
		html.find(this.goods_form_opname).html(tmp_opname);
		html.show();

		// 값을 붙여넣음
		html.find('[name="goods_idx"]').val(goods_idx);
		html.find('[name="op1"]').val(op1);
		html.find('[name="op2"]').val(op2);

		if( account > 0 ){
			html.find('.account').text(this.number_format(account)+'원');
		}
		html.attr('string-code',string);
		$(this.goods_form_obj).filter(':last').after(html);

		// 총액 다시 계산
		this.get_price();

		// 선택초기화
		if( this.removeClassObj != '' ){
			//$(this.removeClassObj).removeClass( this.removeClassName );
		}

		/*
		// 두번째옵션 안비우고 깔별로 사게함 2019-05-13
		$(this.goods_ori_form).find('[name="op1"]').val('');
		$(this.goods_ori_form).find('[name="op2"] option:gt(0)').remove();
		$('.size.optSelect').empty().append("<li style='padding-top:10px'>색상을 먼저 선택해 주세요</li>");
		*/
	}

	// 옵션선택시 상품html 넣어줌
	this.set_opt = function(){
		// 두번째 상자에 옵션 넣어줌
		var obj = $(event.target||event.srcElement);
		var goods_idx = obj.data('goods_idx');
		var form = obj.closest(this.goods_ori_form)

		if( obj.attr('name') == 'op1' && form.find('[name="op2"]').length > 0 ){
			var string = goods_idx+'/'+obj.val();

			var data = this.ajax('getOp2List',string);

			form.find('[name="op2"]').find('option:gt(0)').remove();
			form.find('[name="op2"]').append(data.html);
		}

		// 옵션 다 선택했는지
		if( this.select_check() ){
			return false;
		}

		// 선택옵션 문자열
		var string = this.str_enc('select');

		// 품절이라면 넘김
		if( this.get_soldout(string) ){
			return false;
		}

		// 이미선택한 옵션이라면 넘김
		if( this.opt_already(string) ){
			alert('이미 선택한 옵션입니다.');

			// 선택초기화
			obj.removeClass( this.removeClassName );

			$(this.goods_ori_form).find('[name="op2"]').val('');

			$(event.target||event.srcElement).val('');
			return false;
		}

		// 옵션 설명 지움
		$(this.goods_form_info).hide();

		// 옵션 복사
		this.opt_copy(string);
		// 클래스 지움
		//obj.removeClass( this.removeClassName );
		//$(this.goods_ori_form).find('[name="op2"]').val('');
	}

	this.set_opt_cart = function(){
		// 두번째 상자에 옵션 넣어줌
		var obj = $(event.target||event.srcElement);
		var goods_idx = obj.data('goods_idx');
		var form = obj.closest('form');

		if( obj.attr('name') == 'change_op1' && form.find('[name="change_op2"]').length > 0 ){
			var string = goods_idx+'/'+obj.val();
			var data = this.ajax('getOp2List',string);
			form.find('[name="change_op2"]').find('option:gt(0)').remove();
			form.find('[name="change_op2"]').append(data.html);
		}
	}

	// 옵션선택시 상품html 넣어줌
	this.codi_set_opt = function(){
		// 두번째 상자에 옵션 넣어줌
		var obj = $(event.target||event.srcElement);
		var goods_idx = obj.data('goods_idx');
		var form = obj.closest('.opt_layer');

		if( obj.attr('name') == 'op1' && form.find('[name="op2"]').length > 0 ){
			var string = goods_idx+'/'+obj.val();

			var data = this.ajax('getOp2List',string);

			form.find('[name="op2"]').find('option:gt(0)').remove();
			form.find('[name="op2"]').append(data.html);
		}

		// 옵션 다 선택했는지
		if( this.select_check() ){
			return false;
		}

		// 선택옵션 문자열
		var string = this.str_enc('select');

		var form = $(event.target||event.srcElement).closest('form');

		// 품절이라면 넘김
		if( this.get_soldout(string) ){
			// 체크박스 풀어줌
			form.find('input[type="checkbox"]').prop('checked',false);
			return false;
		}else{
			form.find('input[type="checkbox"]').prop('checked',true);
		}
	}

	// 코디 옵션 확인
	this.codi_confirm = function(){
		var obj = $(event.target||event.srcElement);

		var form = obj.closest('.goods-codi-form');

		var error = false;
		form.find('select').each(function(){
			if( $(this).val() == '' ){
				error = true;
			}
		});

		if( error ){
			alert('옵션을 선택해주세요');
			return false;
		}

		form.find('input[type="checkbox"]').prop('checked',true);
		form.find('.opt_layer').hide();

		this.codi_get_price();
	}

	// 코디 장바구니 담기
	this.codi_set_cart = function(quickType){
		// 코디상품 null check
		if( !this.null_check('codi') ){
			return false;
		}

		var string = this.str_enc('codi');

		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		this.ajax('set_cart',string);

		if( confirm("장바구니에 담았습니다.\n\n장바구니로 이동하시겠습니까?")){
			if( quickType != 'parent' ){
				location.href = '/member/cart.php';
			}else{
				parent.location.href = '/member/cart.php';
			}
		}
	}

	// 선택옵션 삭제
	this.del_opt = function(){
		$(event.target||event.srcElement).closest(this.goods_form_obj).remove();

		// 선택된 옵션없으면 다시 기본설정 info 보여줌
		if( $(this.goods_form_obj).length < 2 ){
			$(this.goods_form_info).show();
		}
		this.get_price();
	}

	// 선택된폼 문자열 생성
	this.str_enc = function(type){
		var string = new Array();

		var obj = $(this.goods_form_obj).filter(":gt(0)");
		if( type == 'select' ){
			obj = $(event.target||event.srcElement).closest('form');
		}else if( type == 'codi' ){
			obj = $(this.goods_codi_form_obj).filter(':visible');
		}

		obj.each(function(e){
			// 코디 상품 체크해제되어 있으면 넘김
			if( $(this).find('.codiIsCheck').length > 0 && !$(this).find('.codiIsCheck').prop('checked') ){
				return true;
			}

			var tmp = new Array();
			var goods_idx = $(this).find('[name="goods_idx"]').val();
			var op1 = $(this).find('[name="op1"]').val();
			var op2 = $(this).find('[name="op2"]').val();
			var ea = $(this).find('[name="ea"]').val();

			if( !ea ){
				ea = 1;
			}

			if( !goods_idx ){
				return true;
			}

			tmp.push( goods_idx );

			if( op1 ){
				tmp.push(op1);
			}

			if( op2 ){
				tmp.push(op2);
			}

			tmp = tmp.join('_')+'/'+ea;
			string.push(tmp);
		});

		return string;
	}

	// 품절체크
	this.get_soldout = function(string){
		var data = this.ajax('get_soldout',string);
		if(data){
			if( data.soldout == 'Y' ){
	//			alert('품절된 상품입니다.');
				$(event.target||event.srcElement).val('').removeClass('active');
				return true;
			}else{
				return false;
			}
		}
	}

	// 총가격 구하기
	this.get_price = function(){
		var string = this.str_enc();

		if( string != '' ){
			var data = this.ajax('get_price',string);

			if( data.isplus_error != 'Y' ){
				$(this.total_price_obj).text( this.number_format(data.total_price) );
				$(this.total_price_obj).next('span').text('원');
			}else{
				$(this.total_price_obj).text( '-' );
				$(this.total_price_obj).next('span').text('');
			}
			$(this.total_ea_obj).text( this.number_format(data.total_ea) );
			if(data.set_sale_total){
				$(".set_sale_price").show();
				$(".set_sale_price .set_price span").text("-"+data.set_sale_total.toLocaleString());
			}else{
				$(".set_sale_price").hide();
				$(".set_sale_price .set_price span").text("-"+data.set_sale_total);
			}
			return data;
		}else{
			$(this.total_price_obj).text( this.number_format($(this.total_price_obj).data('account')));
		}
	}

	// 코디상품 총액
	this.codi_get_price = function(){
		var string = this.str_enc('codi');

		if( string != '' ){
			var data = this.ajax('get_price',string);
			$(this.total_codi_price_obj).text( this.number_format(data.total_price) );
			$(this.total_codi_ea_obj).text( this.number_format(data.total_ea) );

			if( data.period_sale_total > 0 ){
				$(this.total_codi_price_dis_obj).text(this.number_format(data.period_sale_total+data.total_price)).show();
			}else{
				$(this.total_codi_price_dis_obj).hide();
			}
		}else{
			$(this.total_codi_price_obj).text( '0' );
			$(this.total_codi_ea_obj).text( '0' );

			// 기간할인 총액 그려준것 가리기
			$(this.total_codi_price_dis_obj).hide();
		}
	}

	// 장바구니 수량 변경
	this.set_ea = function(num){
	var obj = $(event.target||event.srcElement);
	if(obj.closest('.goods-form-list').length){
		var ea_obj = obj.closest(".goods-form-list").find('[name="ea"]');
	}else{
	var ea_obj = obj.closest(this.goods_form_obj).find('[name="ea"]');
	}
	var ea = ea_obj.val()-0;
		ea += num-0;

		if( ea < 1 ){
			if( confirm('해당 상품을 취소하시겠습니까?') ){
				this.del_opt();
			}else{
				ea = 1;
			}
		}

		ea_obj.val(ea);

		this.get_price();
	}

	// 코디 수량 변경
	this.codi_set_ea = function(num){
		var obj = $(event.target||event.srcElement);
		var ea_obj = obj.closest(this.goods_codi_form_obj).find('[name="ea"]');
		var ea = ea_obj.val()-0;
		ea += num-0;

		if( ea < 1 ){
			ea = 1;
		}

		ea_obj.val(ea);

		this.codi_get_price();
	}

	// 장바구니 등록
	this.set_cart = function(quickType){
		if( !this.null_check() ){
			return false;
		}

		var string = this.str_enc();
		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}
		this.ajax('set_cart',string);
		// open_layer('cart_add_layer');   
		// $('#cart_add_layer .prd_basic.col4').get(0).slick.setPosition()

		if( confirm("장바구니에 담았습니다.\n\n장바구니로 이동하시겠습니까?")){
			if( quickType != 'parent'){
				location.href = '/member/cart.php';
			}else{
				parent.location.href = '/member/cart.php';
			}
		}
	}
	// 장바구니 등록
	this.set_cart_dev = function(quickType){
		if( !this.null_check() ){
			return false;
		}

		var string = this.str_enc();
		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}
		this.ajax('set_cart',string);
		open_layer('cart_add_layer');   
		$('#cart_add_layer .prd_basic.col5').get(0).slick.setPosition()

		// if( confirm("장바구니에 담았습니다.\n\n장바구니로 이동하시겠습니까?")){
		// 	if( quickType != 'parent'){
		// 		location.href = '/member/cart.php';
		// 	}else{
		// 		parent.location.href = '/member/cart.php';
		// 	}
		// }
	}
	// 리스트에서 장바구니 담기
	this.set_cart_list = function(className){
		var obj = $(event.target||eventSrcElement);
		var form = className ? obj.closest('.'+className) : obj.closest(this.goods_form_obj);
		var string = new Array();

		var goods_idx = form.find('[name="goods_idx"]').val();
		var op1 = form.find('[name="op1"]').val();
		var op2 = form.find('[name="op2"]').val();
		var ea = form.find('[name="ea"]').val();



		if( form.find('[name="op1"]').length > 0 && op1 == '' ){
			alert('옵션을 선택해주세요');
			form.find('[name="op1"]').focus();
			return false;
		}

		if( form.find('[name="op2"]').length > 0 && op2 == '' ){
			alert('옵션을 선택해주세요');
			form.find('[name="op2"]').focus();
			return false;
		}
		var pushstring = goods_idx+'_'+op1;
		if(op2){
			pushstring += '_'+op2;
		}
		pushstring += '/'+ea;
		string.push(pushstring);

		this.ajax('set_cart',string);
		if( confirm("장바구니에 담았습니다.\n\n장바구니로 이동하시겠습니까?")){
			location.href = '/member/cart.php';
		}
	}

	// 위시리스트 등록/삭제 ( 목록 )
	this.set_wish = function(){
		var string = this.str_enc();

		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}
		this.ajax('set_wish',string);
	}

	// 단일품목 좋아요 등록
	this.set_wish_single = function(goods_idx){
		var data = this.ajax('set_wish_single', goods_idx);
		eval( data.js_code );
	}

	// 상품리스트 썸네일 좋아요 등록/해제 (2019-04-09 조영재)
	this.set_thumb_wish = function(goods_idx){
		var data = this.ajax('set_thumb_wish', goods_idx);
		eval( data.js_code );
	}
	
	this.buy = function(quickType){
		// 번개배송 보는상태
		sessionStorage.setItem('delFreeShow','N');

		if( !this.null_check() ){
			return false;
		}

		CookieProc.delCookie('buymethod');

		var string = this.str_enc();
		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		var thCheck = this.ajax('thCheck',string);
		if( thCheck ){
			if( thCheck.sojin_msg ){
				alert(thCheck.sojin_msg);
				return false;
			}

			if( !confirm(thCheck.msg) ){
				return false;
			}
		}

		var data = this.ajax('buy',string);

		if( data.code ){
			eval( data.code );
			return false;
		}

		if( data.url != '' ){
			if( quickType != 'parent'){
				location.href = data.url;
			}else{
				parent.location.href = data.url;
			}
		}else{
			alert('주문에 실패하였습니다.');
		}
	}

	// 카카오 구매
	this.kakao_buy = function(quickType){
		CookieProc.setCookie('buymethod','W',24);

		var string = this.str_enc();

		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		var thCheck = this.ajax('thCheck',string);
		if( thCheck ){
			if( thCheck.sojin_msg ){
				alert(thCheck.sojin_msg);
				return false;
			}

			if( !confirm(thCheck.msg) ){
				return false;
			}
		}

		// 옵션별 품절체크
		string.forEach(function(item){
			// 품절이라면 넘김
			var data = GoodsProc.ajax('get_soldout',item);
			if( data.soldout == 'Y' ){
				var del_idx = string.indexOf(item);
				string.splice(del_idx,1);
			}
		});

		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		var data = GoodsProc.ajax('buy',string);

		if( data.url != '' ){
			if( quickType != 'parent'){
				location.href = data.url;
			}else{
				parent.location.href = data.url;
			}
		}else{
			alert('주문에 실패하였습니다.');
		}
	}

	// 기본쿠폰 얻기
	this.get_default_coupon = function(){
		var data = this.ajax('get_default_coupon');
		eval( data.js_code );
	}

	this.att_day_coupon = function(){
		var data = this.ajax('att_day_coupon');
		eval( data.js_code );
	}

	// 코디상품 구매
	this.codi_buy = function(quickType){
		if( !this.null_check('codi') ){
			return false;
		}

		var string = this.str_enc('codi');
		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}
		var data = this.ajax('buy',string);

		if( data.url != '' ){
			if( quickType != 'parent' ){
				location.href = data.url;
			}else{
				parent.location.href = data.url;
			}
		}else{
			alert('주문에 실패하였습니다.');
		}
	}

	// 네이버 구매
	this.naver_buy = function(){
		if( !this.null_check() ){
			return false;
		}

		var string = this.str_enc();
		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		var thCheck = this.ajax('thCheck',string);
		if( thCheck ){
			if( thCheck.sojin_msg ){
				alert(thCheck.sojin_msg);
				return false;
			}

			if( !confirm(thCheck.msg) ){
				return false;
			}
		}

		// 옵션별 품절체크
		string.forEach(function(item){
			// 품절이라면 넘김
			var data = GoodsProc.ajax('get_soldout',item);
			if( data.soldout == 'Y' ){
				var del_idx = string.indexOf(item);
				string.splice(del_idx,1);
			}
		});

		if( string == '' ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		var data = this.ajax('naver_buy',string);

		if( data.code ){
			eval( data.code );
			return false;
		}

		if( data.url != '' ){
			window.open(data.url);
		}else{
			alert('주문에 실패하였습니다.');
		}
	}

	// 단일상품 정보
	this.getGoods = function(code){
		var data = this.ajax('getGoods',code);
		return data;
	}

	// 숫자 쉼표 포멧변경
	this.number_format = function(number, decimals, dec_point, thousands_sep){
		number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
		var n = !isFinite(+number) ? 0 : +number,
		prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
		dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
		s = '',
		toFixedFix = function(n, prec) {
			var k = Math.pow(10, prec);
			return '' + (Math.round(n * k) / k)
				.toFixed(prec);
		};

		// Fix for IE parseFloat(0.55).toFixed(0) = 0;
		s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}

		if ((s[1] || '').length < prec) {
			s[1] = s[1] || '';
			s[1] += new Array(prec - s[1].length + 1).join('0');
		}
		return s.join(dec);
	}
	//오늘만 상품
	this.thOp2List = function(idx,type){
		if(type == 'view'){
			var obj = $(event.target||event.srcElement).closest(".select-form");
			var box = obj.find('.no-th').closest('.colorbox');
			$('.slide_color.optSelect .colorbox a.active').removeClass('active');
			$('.size.optSelect').empty().append(defaultSize);

				// 색상 초기화
			if(!$('.optSelect a').hasClass("active")){
				$(".sizecolorbox small").show();
				$(".sizecolorbox .scoptname").text('');
			}
		}else{
			var obj = $(event.target||event.srcElement).closest(".goods-form-list");
			var box = obj.find('option.no-th');
			
			//셀박초기화
			obj.find('select[name=op2] option:gt(0)').remove();
			obj.find(".opt_layer select").each(function(){
				$(this).find('option').eq(0).prop("selected",true);
			})
		}
		obj.find('.thico').toggleClass('on');
		
		// if(!$('.optSelect a').hasClass("active")){
		// 	$(".sizecolorbox small").show();
		// 	$(".sizecolorbox .scoptname").text('');
		// }
		
		if( $('.thico').hasClass('on') ){
			if( obj.find('.no-th').length > 0 ){

				box.hide();
				return false;
			}
			$.ajax({
				url:this.classFileAddr,
				type:'post',
				data:{'method':'thOp2List','string':idx},
				success:function(data){
					data = JSON.parse(data);
					for(i in data){
						if(type == 'view'){
							obj.find('a[data-ops_idx="'+data[i]+'"]').addClass('no-th').closest('.colorbox').hide();

						}else{
							obj.find('option[data-ops_idx="'+data[i]+'"]').addClass('no-th').hide();
						}
					}
				},
				beforeSend:function(){
					$('#dimmed').show();
				},
				complete:function(){
					$('#dimmed').hide();
				}
			});
		}else{
			box.show();
		}

	}
	// 여기서부터 커스텀 영역 시작 {
		// 사이즈 변경시 보여주는 수치
			this.colorchiponoff = function(){
				var obj = $(event.target||event.srcElement).closest('.colorchip');
				if(obj.css('overflow') == 'hidden'){
					obj.css('overflow',"visible");
					obj.find(".colorchipbox").show();
				}else{
					obj.css('overflow',"hidden");
					obj.find(".colorchipbox").hide();
				}
			}
			this.sizeChange = function(){
				var obj = $(event.target||event.srcElement);
				if( obj.hasClass('active') ){
					return false;
				}

				obj.closest('.size_opt').find('li a').removeClass('active');
				obj.addClass('active');

				var eq = obj.closest('li').index();
				obj.closest('.size_info').find('.eleNum').hide().eq(eq).fadeIn('fast');
			}

			// qna 관련
			this.toggleQna = function(){
				var obj = $(event.target||event.srcElement);
				obj.closest('tr').next('tr').toggle();
			}

			this.deleteQna = function(num){
				if(!confirm('삭제하시겠습니까?')){
					return false;
				}

				var data = this.ajax('deleteQna',num);
				eval(data.code);
			}

			// 주문페이지 상품 삭제 2019-04-23 조영재
			this.cart_del = function(cart_idx,basket_str,delfree) {
				if(!confirm('삭제하시겠습니까?')){
					return false;
				}

				var couponindex = $('input[name="coupon_idx"]:checked').val(); // 선택된 쿠폰
				var string = cart_idx+'/'+basket_str+'/'+couponindex+'/'+delfree;
				var data = this.ajax('cart_del',string);

				eval(data.code);
			}

			// 주문페이지 상품 추가
			this.order_set_cart = function(basket_idx){
				var couponindex = $('input[name="coupon_idx"]:checked').val(); // 선택된 쿠폰
				var obj = $(event.target||eventSrcElement);
				var form = obj.closest(this.goods_form_obj);
				var string = new Array();

				var goods_idx = form.find('[name="goods_idx"]').val();
				var op1 = form.find('[name="op1"]').val();
				var op2 = form.find('[name="op2"]').val();
				var ea = form.find('[name="ea"]').val();
				string.push(goods_idx+'_'+op1+'_'+op2+'/'+ea);


				if( form.find('[name="op1"]').length > 0 && op1 == '' ){
					alert('옵션을 선택해주세요');
					form.find('[name="op1"]').focus();
					return false;
				}

				if( form.find('[name="op2"]').length > 0 && op2 == '' ){
					alert('옵션을 선택해주세요');
					form.find('[name="op2"]').focus();
					return false;
				}

				var returnIndex = this.ajax('order_set_cart',string);

				location.href = '/order/buy.php?basketindex='+basket_idx+'-'+returnIndex+'&couponindex='+couponindex;
			}

			// 퀵뷰 영역
			this.quickView = function(goods_idx,op1,firstBuy){
				$('#quickViewFrame iframe').attr('src','/shop/view_quick.php?index_no='+goods_idx+'&op1='+op1+'&firstBuy='+firstBuy);
				$('#quickViewFrame').show();

				$('html,body').css('overflow','hidden');
			}

			// 퀵뷰 동영상
			this.quickViewVideo = function(goods_idx,op1,firstBuy){
				$('#quickViewVideoFrame iframe').attr('src','/shop/view_quick_video.php?index_no='+goods_idx+'&op1='+op1+'&firstBuy='+firstBuy);
				$('#quickViewVideoFrame').show();

				$('html,body').css('overflow','hidden');
			}

			// 퀵뷰 동영상
			this.quickViewVideo_dev = function(goods_idx,op1){
				$('#quickViewVideoFrame iframe').attr('src','/shop/view_quick_video_dev.php?index_no='+goods_idx+'&op1='+op1);
				$('#quickViewVideoFrame').show();

				$('html,body').css('overflow','hidden');
			}

			this.quickViewClose = function(){
				$('#quickViewFrame iframe, #quickViewVideoFrame iframe').attr('src','');
				$('#quickViewFrame, #quickViewVideoFrame').hide();
				$('html,body').css('overflow','auto');
			}
			// 퀵뷰 링크 변환
			this.quickView_href = function(link){
				$(parent.document).find("#quickViewFrame iframe").attr("src",link);
			}
			// 취소변경, 교환반품페이지 옵션선택
			this.getOp2 = function(){
				var obj = $(event.target||event.srcElement);
				var tr = obj.closest('tr');
				var goods_idx = tr.find('[name="goods_idx[]"]').val();

				var string = goods_idx+'/'+obj.val();
				var data = this.ajax('getOp2List2',string);

				tr.find('[name="op2[]"]').find('option:gt(0)').remove();
				tr.find('[name="op2[]"]').append(data.html);

			}
			// view 팝업 오픈
			this.review_detail_view_open = function(index_no,type,sort,op1,op2,text){
				var obj = $(event.srcElement||event.target);
				var idx = obj.closest('li').index();
				var op1 = op1;
				var op2 = op2;
				var sort = sort;
				var text = text;

				$.ajax({
					url : '/review/review_view.php',
					type: 'post',
					data : {
						index_no : index_no,
						op1:op1,
						op2:op2,
						sort:sort,
						text:text,
					},
					async: false,
					success: function(data){
						
						$('#popView',document).html(data);
						$('#popView',document).show();
						$('#popView .popslide',document).slick({
							arrows: true,
							dots: true,
							infinite: true,
							slidesToShow: 1,
							slidesToScroll: 1
						});
						if(type =='view_page'){
							$('#popView .popslide',parent.document).slick('slickGoTo',idx);
						}
						try{
							insert_buyloc('review_idx='+index_no);
						}catch(e){}
					}
				});
			}

			this.review_detail_bestview_open = function(index_no,type){
				var obj = $(event.srcElement||event.target);
				var idx = obj.closest('li').index();
				
				$.ajax({
					url : '/review/review_view_reviewbest.php',
					type: 'post',
					data : {
						index_no : index_no
					},
					async: false,
					success: function(data){
						$('#popView',parent.document).html(data);
						$('#popView',parent.document).show();
						$('#popView .popslide',parent.document).slick({
							arrows: true,
							dots: true,
							infinite: true,
							slidesToShow: 1,
							slidesToScroll: 1
						});
						if(type =='view_page'){
							$('#popView .popslide',parent.document).slick('slickGoTo',idx);
						}
						try{
							insert_buyloc('review_idx='+index_no);
						}catch(e){}
					}
				});
			}

			this.cartOp1List = function(goods_idx){ //옵션1 리스트에 장바구니에서 불러오는거
				var t = $(event.target);
				
				if( t.find('option').length > 1 ){
					return;
				}
				var op1 = this.ajax('getOp1ListJson',goods_idx);
				$.each(op1,function(k,v){
					var soldout = v.soldout ? 'disabled':'';
					t.append('<option value="'+v.idx+'" data-ops_idx="'+v.idx+'" '+soldout+' >'+v.name+'</option>');
				});
			}
	// }
}

// 기본클래스 생성
var GoodsProc = new GoodsProc();