function MemberProc(){
	this.goods_form_obj = '.goods-form'; // 리스트 폼

	// 파일 경로
	this.classFileAddr = '/class/member_ajax.php'; // 해당파일 위치

	// 기본 ajax 함수
	this.ajax = function(SendData){
		SendData = JSON.parse(SendData);

		var data = $.ajax({
						url:this.classFileAddr,
						type:'post',
						data:SendData,
						async:false,
						success:function(data){}
					}).responseText;
		if( data ){
			data = JSON.parse(data);
			return data;
		}
	}

	// 선택된폼 문자열 생성
	this.str_enc = function(type){
		var string = new Array();
		var obj = $(this.goods_form_obj).filter(":gt(0)");

		obj.each(function(e){
			// 코디 상품 체크해제되어 있으면 넘김
			if( $(this).find('input[name="cart_idxs[]"]').length > 0 && !$(this).find('input[name="cart_idxs[]"]').prop('checked') ){
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

	// 장바구니 삭제
	this.cart_del = function(index_no){
		if( !confirm('삭제하시겠습니까?')){
			return false;
		}

		var data = {};
		data.method = 'cartDel';
		data.string = index_no;
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval( returnData.js_code );
	}

	// 선택상품 주문
	this.choose_buy = function(){
		if ( $('[name="cart_idxs[]"]:checked').length <= 0 ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		var string = this.str_enc();
		var thCheck = GoodsProc.ajax('thCheck',string);
		if( thCheck ){
			if(thCheck.sojin_msg){
				alert(thCheck.sojin_msg);
				return false;
			}

			if( !confirm(thCheck.msg) ){
				return false;
			}
		}

		CookieProc.delCookie('buymethod');
		var idxs = new Array();
		$('[name="cart_idxs[]"]:checked').each(function(){
			idxs.push($(this).val());
		});

		sessionStorage.setItem('delFreeShow','N');
		location.href = "/order/buy.php?basketindex="+idxs.join('-');
	}

	// 전체 선택 구매
	this.all_buy = function(){
		$('#allCheck').prop('checked',true);
		$('input[name="cart_idxs[]"]').prop('checked',true);

		this.choose_buy();
	}

	// 선택상품 삭제
	this.choose_del = function(){
		var obj = $(this.goods_form_obj).filter(":gt(0)");

		var data = new Array();
		obj.each(function(){
			var checkObj = $(this).find('input[name="cart_idxs[]"]');
			if( !checkObj.prop('checked') ){
				return true;
			}

			data.push(checkObj.val());
		});

		if( data.length <= 0 ){
			alert('선택된 상품이 없습니다.');
			return false;
		}

		if( !confirm('삭제하시겠습니까?')){
			return false;
		}
		var idxs = data.join(',');
		var data = {};
		data.method = 'cartDel';
		data.string = idxs;
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval( returnData.js_code );
	}

	// 선택상품 좋아요
	this.cart_all_like = function(){
		var data = {};
		data.method = 'cart_all_like';
		data.string = '';
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval( returnData.js_code );
	}

	// 장바구니 전부 비우기
	this.cart_all_del = function(){
		$('#allCheck').prop('checked',true);
		$('input[name="cart_idxs[]"]').prop('checked',true);

		this.choose_del();
	}

	// 장바구니 수량 변경
	this.change_ea = function(num){
		var obj = $(event.target||event.srcElement);
		var form = obj.closest('form');
		var cartIdx = form.find('input[name="cart_idx"]').val();
		var ea = form.find('input[name="ea"]').val();
		var newEA = Number(ea)+Number(num);

		if( newEA <= 0 ){
			this.cart_del(cartIdx); // 장바구니 삭제 함수
			return false;
		}

		var data = {};
		data.method = 'cartChangeEA';

		var stringData = {};
		stringData.index_no = cartIdx;
		stringData.ea = newEA;
		data.string = stringData;
		data = JSON.stringify(data);

		this.ajax(data); // 수량변경 로직
		form.find('input[name="ea"]').val(newEA); // 화면에 그려줌

		var data = GoodsProc.get_price(); // 총 결제금액
		var str = form.find('input[name=goods_idx]').val()+'_'+form.find('input[name=op1]').val()+'_'+form.find('input[name=op2]').val()+'/'+newEA;

		var op_account = GoodsProc.ajax('get_price',[str]);
		form.find('.opt-prc').text(BuyProc.number_format(op_account.total_price));
		cartCalcul();
		// cartCalcul();
		// $('#total_price').text(BuyProc.number_format(data.total_price));
		// $('#del_account').text(BuyProc.number_format(data.del_account));
		// $('#use_account').text(BuyProc.number_format(data.use_account));
	}

	// 내가 체크한것 함께 체크되는 input
	this.with_check = function(selector){
		var obj = $(event.target||event.srcElement);
		var checked = obj.prop('checked');
		$(selector).prop('checked',checked);
	}


	// 로그인 데이터 체크
	this.loginDataCheck = function(){
		var obj = $(event.target||event.srcElement);
		var form = obj.closest('form');

		if( $.trim(form.find('[name="id"]').val()) == '' ){
			form.find('[name="id"]').focus();
			alert('아이디를 입력해주세요');
			return false;
		}

		if( $.trim(form.find('[name="passwd"]').val()) == '' ){
			form.find('[name="passwd"]').focus();
			alert('비밀번호를 입력해주세요');
			return false;
		}

	}

	// 즐겨찾기
	this.addFavor = function(){
		var data = {};
		data.method = 'addFavor';
		data.string = '';
		data = JSON.stringify(data);

		var returnData = this.ajax(data);

		if( returnData ){
			if( returnData.js_code ){
				eval( returnData.js_code );
				return false;
			}
		}

        var bookmarkURL = "https://attrangs.co.kr";
        var bookmarkTitle = "아뜨랑스";
        var triggerDefault = false;

        if (window.sidebar && window.sidebar.addPanel) {
            // Firefox version < 23
            window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
        } else if ((window.sidebar && (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)) || (window.opera && window.print)) {
            // Firefox version >= 23 and Opera Hotlist
            var $this = $(this);
            $this.attr('href', bookmarkURL);
            $this.attr('title', bookmarkTitle);
            $this.attr('rel', 'sidebar');
            $this.off(e);
            triggerDefault = true;
        } else if (window.external && ('AddFavorite' in window.external)) {
            // IE Favorite
            window.external.AddFavorite(bookmarkURL, bookmarkTitle);
        } else {
            // WebKit - Safari/Chrome
            alert(returnData.msg+"\n"+(navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Cmd' : 'Ctrl') + '+D 키를 눌러 즐겨찾기에 등록하실 수 있습니다.');
        }

		location.reload();

        return triggerDefault;
	}

	this.getGradeCoupon = function(){ // 등급별 쿠폰 받기
		var data = {};
		data.method = 'getGradeCoupon';
		data.string = '';
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval( returnData.js_code );
	}

	this.getTypeCoupon = function(type){
		var data = {};
		data.method = 'getTypeCoupon';
		data.string = type;
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval( returnData.js_code );
	}

	this.delUserKeyword = function(){
		if( !confirm('내 검색어를 비우시겠습니까?' )){
			return false;
		}

		CookieProc.delCookie('user_keyword');
		if( $('.ticker_user_search_keyword .delKeyword').length <= 0){
			alert('검색어 내역이 존재하지 않습니다.');
			return false;
		}else{
			$('.ticker_user_search_keyword .delKeyword').remove();
			$('.noKeyword').show();
		}
	}

	this.getGradeCoupons = function() { // 이달의 쿠폰받기
		var data = {};
		data.method = 'getGradeCoupons';
		data.string = '';
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval( returnData.js_code );
	}
	//즐겨찾기
	this.wishSet = function(num_idx,type){
		event.preventDefault();
		event.stopPropagation();
		if(!num_idx){ return false;}
		var obj = $(event.target);
		$.ajax({
			url:this.classFileAddr,
			type:'post',
			async:false,
			data:{'method':'wishSet','num_idx':num_idx,'type':type},
			success:function(code){
				if(code) eval(code);
			}
		});
	}

	// 첫구매 취소
	this.firstBuyCancel = function(){
		var data = {};
		data.method = 'firstBuyCancel';
		data = JSON.stringify(data);

		var returnData = this.ajax(data);

		if( returnData.code ){
			eval(returnData.code);
		}

		// location.href = location.href+'&first_ignore=Y';
	}
	this.firstBuyRestore = function(){
		var data = {};
		data.method = 'firstBuyRestore';
		data = JSON.stringify(data);
		var returnData = this.ajax(data);

		//if( returnData.code ){
			//eval(returnData.code);
		//}
	}
}

// 기본클래스 생성
var MemberProc = new MemberProc();