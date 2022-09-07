function OrderProc(){
	// 실제 전송용 폼
	this.form_obj = '#orderForm';

	// 주문번호,주문자명,비밀번호
	this.ordername_obj = '#ordername_obj';
	this.orderno_obj = '#orderno_obj';
	this.passwd_obj = '#passwd_obj';

	// 파일 경로
	this.classFileAddr = '/class/order_ajax.php'; // 해당파일 위치

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

	// 거래명세서 받을 수 있나 체크
	this.getTradeReceipt = function(){
		var data = new Object();
		data.method = 'getTradeReceipt';
		data.string = '';
		data.orderno = $(this.orderno_obj).val();
		data.ordername = $(this.ordername_obj).val();
		data.passwd = $(this.passwd_obj).val();

		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval(returnData.js_code);
	}

	// 거래명세서 보는 화면으로 submit
	this.getReceiptSubmit = function(){
		window.open('','receipt_frame','width=970,height=800');

		$(this.form_obj).attr('action','/member/receipt.php');
		$(this.form_obj).attr('target','receipt_frame');
		$(this.form_obj).submit();

		$(this.form_obj).attr('action','');
		$(this.form_obj).attr('target','');
	}

	// 추가결제
	this.pay = function(selector){
		// 기존 추가폼 싹다 삭제
		$('.payForm').remove();

		if( !selector ){
			var obj = $(event.target||event.srcElement);
		}else{
			var obj = $(selector);
		}

		var target_obj = obj.closest('#pgDiv');
		var buymethod = target_obj.find('[name="buymethod"]').val();
		var idx = target_obj.find('#pgId').val();

		if( buymethod == 'B'){
			// 무통장일때 체크
			if( $('.bank_obj').val() == '' ){
				$('.bank_obj').focus();
				alert('은행을 선택해주세요');
				return false;
			}

			if( $('.inname_obj').val() == '' ){
				$('.inname_obj').focus();
				alert('입금자명을 입력해주세요.');
				return false;
			}

			if( $('.indate_obj').val() == '' ){
				$('.indate_obj').focus();
				alert('입금예정일을 선택해주세요.');
				return false;
			}

			if( !confirm('무통장입금으로 진행하시겠습니까?') ){
				return false;
			}

			var data = new Object();
			data.method = 'updateAccountInfo';
			data.string = '';
			data.orderno = $(this.orderno_obj).val();
			data.ordername = $(this.ordername_obj).val();
			data.passwd = $(this.passwd_obj).val();
			data.bank = $('.bank_obj').val();
			data.inname = $('.inname_obj').val();
			data.indate = $('.indate_obj').val();
			data.idx = idx;
			data = JSON.stringify(data);

			var returnData = this.ajax(data);
			eval(returnData.js_code);

			return false;
		}else if( buymethod == 'K'){
			$.ajax({
				url:'/pg/kakaopay/pay.php',
				type:'get',
				async:false,
				data:{'mode':'ready_part','market_idx':$(this.orderno_obj).val(),'account_idx':idx},
				success:function(code){
					eval(code);
				}
			});
			return false;
		}

		// 결제폼 불러와서 넣어줌
		$.ajax({
			url:'/pg/inipay/sample/payForm.php',
			type:'post',
			async:false,
			data:{'index_no':idx,'buymethod':buymethod},
			success:function(payForm){
				target_obj.append(payForm);
			}
		});

		var payFormId = target_obj.find('form').attr('id');
		INIStdPay.pay(payFormId);

		$('#pgDiv').hide();
	}


	// 구매확정 로직
	this.orderFix = function(ordername,orderno,passwd){
		if( !confirm("구매확정하시겠습니까? 구매확정하시면 반품/교환이 불가능합니다.") ){
			return false;
		}
		var data = new Object();
		data.method = 'orderFix';
		data.string = '';
		if( !orderno ){
			data.orderno = $(this.orderno_obj).val();
		}else{
			data.orderno = orderno;
		}

		if( !ordername ){
			data.ordername = $(this.ordername_obj).val();
		}else{
			data.ordername = ordername;
		}
		console.log(data.ordername);
		if( !passwd ){
			data.passwd = $(this.passwd_obj).val();
		}else{
			data.passwd = passwd;
		}

		data = JSON.stringify(data);


		var returnData = this.ajax(data);
		eval(returnData.js_code);
	}

	// 취소/변경 페이지로 이동
	this.orderItemChange = function(ordername,orderno,passwd){
		var form = $(this.form_obj);

		// 기본폼정보
		if( ordername ){
			form.find('[name="ordername"]').val(ordername);
		}

		if( orderno ){
			form.find('[name="orderno"]').val(orderno);
		}

		if( passwd ){
			form.find('[name="passwd"]').val(passwd);
		}

		$(this.form_obj).attr('action','/member/order_change.php');
		$(this.form_obj).submit();

		$(this.form_obj).attr('action','');
	}

	// 교환 반품 페이지로 이동
	this.orderItemReturn = function(ordername,orderno,passwd){
		if( !confirm("교환,반품신청해 주시면 저희 아뜨랑스에서 CJ대한택배로\n자동회수접수 되므로 고객님께서는 CJ대한택배로 따로\n회수접수 안해주셔도 됩니다.\n\n반품시 받으신 사은품은 꼭! 같이 동봉해주세요:)\n누락되는 경우, 사은품 금액만큼 차감되어 환불처리 됩니다.\n\n*선배송 받아보시고 후배송상품이 남아있을경우 후배송상품\n마저 받아보신후 신청 부탁드리며, 따로 받으셨어도\n★꼭! 한상자에 담아서보내주셔야 택배비\n과중부담이 없으십니다.\n\n★★불량 교환/반품시 꼭 불량사유(불량시 불량위치 등)\n메모 동봉하여 보내주세요\n더욱 신속하게 처리 받으실 수 있습니다★★") ){
			return false;
		}

		var form = $(this.form_obj);

		// 기본폼정보
		if( ordername ){
			form.find('[name="ordername"]').val(ordername);
		}

		if( orderno ){
			form.find('[name="orderno"]').val(orderno);
		}

		if( passwd ){
			form.find('[name="passwd"]').val(passwd);
		}

		$(this.form_obj).attr('action','/member/order_return.php');
		$(this.form_obj).submit();

		$(this.form_obj).attr('action','');
	}

	// 배송비 구하기전 빈값체크
	this.returnErrorCheck = function(stop){
		var error = false;

		var i = 0;
		$('[name="claim_type[]"]').each(function(){
			if( !$(this).val() ){
				return true;
			}

			i++;

			var reason_obj = $(this).closest('tr').find('select[name="claim_reason[]"]');
			if( reason_obj.val() == '' && $(this).closest('tr').find('select[name="claim_type[]"]').val() != 4 ){
				if( stop ){
					alert('사유를 선택해주세요');
					reason_obj.focus();
				}
				error = true;
				return false;
			}

			if( $(this).val() == '2' || $(this).val() == '3' ){ // 반품이나 취소는 옵션선택 안해도 됨
				return true;
			}

			var op1_obj = $(this).closest('tr').find('select[name="op1[]"]');
			var op2_obj = $(this).closest('tr').find('select[name="op2[]"]');

			if( op1_obj.length > 0 && op1_obj.val() == '' ){
				if( stop ){
					alert('옵션을 선택해주세요');
					op1_obj.focus();
				}
				error = true;
				return false;
			}

			if( op2_obj.length > 0 && op2_obj.val() == '' ){
				if( stop ){
					alert('옵션을 선택해주세요');
					op2_obj.focus();
				}
				error = true;
				return false;
			}
		});

		if( i == 0 ){
			if( stop ){
				alert('처리할 상품이 없습니다.');
			}
			error = true;
		}

		return error;
	}

	// 배송비 구하는 함수
	this.getReturnDelAccount = function(){
		// 에러체크
		if( this.returnErrorCheck(true) ){
			return false;
		}

		var data = $.ajax({
						url:'/class/returnDelAccountApi.php',
						type:'post',
						data:$('#exchange_form').serialize(),
						async:false,
						success:function(data){
						}
					}).responseText;

		return JSON.parse(data);
	}

	// 배송비 실시간으로 구하는 로직
	this.getReturnDelAccountLive = function(){
		// 에러체크
		if( this.returnErrorCheck(false) ){
			$('.calcul_delAccount').text(0);
			return false;
		}

		var data = $.ajax({
						url:'/class/returnDelAccountApi.php',
						type:'post',
						data:$('#exchange_form').serialize(),
						async:false,
						success:function(data){
						}
					}).responseText;

		var returnData =  JSON.parse(data);
		$('.calcul_delAccount').text(this.number_format(Number(returnData.del_account)+Number(returnData.add_del_account)));
	}

	// 수거지 정보와 동일
	this.sameDelInfo = function(){
		var obj = $(event.target||event.srcElement);
		if( obj.prop('checked') ){
			$('#receive_zip').val($('#del_zip').val());
			$('#receive_addr1').val($('#del_addr1').val());
			$('#receive_addr2').val($('#del_addr2').val());
		}
	}

	// 실제 교환/반품 접수 로직
	this.returnOK = function(){
		if( this.returnErrorCheck(true) ){
			$('.calcul_delAccount').text(0);
			return false;
		}

		if( $('[name="payment_type"]:checked').val() == 2 ){
			if( $.trim($('[name="payment_inname"]').val()) == '' ){
				alert('입금자명을 입력해주세요');
				$('[name="payment_inname"]').focus();
				return false;
			}
		}

		var error = false;
		$('#exchange_form .required:visible').each(function(){
			if( $.trim($(this).val()) == '' ){
				alert($(this).data('required_msg')+' 입력해주세요');
				$(this).focus();
				error = true;
				return false;
			}
		});


		// 상품불량은 이미지 첨부 필수
		var imgError = false;
		var simpleReason = false; // 단순변심
		$('[name="claim_type[]"]').each(function(){
			if( $(this).val() ){ // 교환이나 반품선택후
				var tr = $(this).closest('tr');
				if( tr.find('[name="claim_reason[]"]').val() == '상품불량' || tr.find('[name="claim_reason[]"]').val() == '오배송' ){
					imgError = true;
				}else if( tr.find('[name="claim_reason[]"]').val() == '단순변심' ){
					simpleReason = true;
				}
			}
		});

		$('[name="file[]"]').each(function(){
			if($(this).val()){
				imgError = false;
			}
		});

		if( $('input[name="admin_idx"]').val() ){
			imgError = false;
		}

		if( imgError ){
			alert('상품불량시 이미지를 첨부해주세요');
			return false;
		}

		if( simpleReason && $('#memo').val() == '' ){
			alert('단순변심시 상세사유를 입력해주세요');
			$('#memo').focus();
			return false;
		}

		if( error ){
			return false;
		}

		var memgrade = $('#vip_obj').data('memgrade');
		var memgradename = "";
		if( memgrade == 1 ){
			memgradename = "VVIP";
		}else if( memgrade == 93 ){
			memgradename = "VVIP";
		}else if( memgrade == 94 ){
			memgradename = "VIP";
		}
		if( $('#vip_obj').val() != 1 ){
			if(!confirm('교환/반품을 접수하시겠습니까?')){
				return false;
			}
		}else{
			if(!confirm("어머! "+memgradename+" 시군요\n어떻게 우리가 교환/반품비를 받겠어요 >.< \n무료로 교환/반품 도와드릴께요 편하게 반품하세요!!\n\n부분 반품 1회에 한해서만  반품비 무료입니다.\n\n(전체반품은 반품비(초도배송비포함) 고객부담입니다)")){
				return false;
			}
		}

        $('#exchange_form').ajaxForm({
            url:"/class/returnProcess.php",
            enctype : "multipart/form-data",
			async:false,
            success : function(jsonData){
				alert('접수되었습니다.');
				var data = JSON.parse(jsonData);
				eval(data.js_code);
            }
        });

        $('#exchange_form').submit() ;
	}

	// 실제 취소/변경 접수 로직
	this.changeOK = function(){
		if( this.returnErrorCheck(true) ){
			return false;
		}

		if( $('[name="payment_type"]:checked').val() == 2 ){
			if( $.trim($('[name="payment_inname"]').val()) == '' ){
				alert('입금자명을 입력해주세요');
				$('[name="payment_inname"]').focus();
				return false;
			}
		}

		var error = false;
		$('#exchange_form .required:visible').each(function(){
			if( $.trim($(this).val()) == '' ){
				alert($(this).data('required_msg')+' 입력해주세요');
				$(this).focus();
				error = true;
				return false;
			}
		});

		if( error ){
			return false;
		}

		if(!confirm('주문서 변경을 접수하시겠습니까?')){
			return false;
		}

		var data = $.ajax({
						url:'/class/changeProcess.php',
						type:'post',
						data:$('#exchange_form').serialize(),
						async:false,
						success:function(data){
						}
					}).responseText;
		var returnData =  JSON.parse(data);
		eval(returnData.js_code);
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

	// 환불계좌변경
	this.refundChange = function(){
		var obj = $(event.target||event.srcElement).find('option:selected');

		var bank = obj.data('bank');
		var banknum = obj.data('banknum');
		var name = obj.data('name');

		$('input[name="bank"]').val(bank);
		$('input[name="bank_num"]').val(banknum);
		$('input[name="bank_name"]').val(name);
	}

	// 수취인정보 변경
	this.deliChange = function(){
		if( !confirm('수취인 정보를 수정하시겠습니까?') ){
			return false;
		}

		var obj = $(event.target||event.srcElement);
		var form = obj.closest('form');

		var error = false;

		form.find('.required').each(function(){
			if( $.trim($(this).val()) == '' ){
				alert( $(this).data('msg')+'를 입력해주세요');
				$(this).focus();
				error = true;
				return false;
			}
		});

		if( error ){
			return false;
		}

		var data = new Object();
		data.method = 'deliChange';
		data.string = '';
		data.ordername = form.find('[name="ordername"]').val();
		data.orderno = form.find('[name="orderno"]').val();
		data.passwd = form.find('[name="passwd"]').val();

		data.del_name = form.find('[name="del_name"]').val();
		data.del_cp = form.find('[name="del_cp"]').val();
		data.del_zip = form.find('[name="del_zip"]').val();
		data.del_addr1 = form.find('[name="del_addr1"]').val();
		data.del_addr2 = form.find('[name="del_addr2"]').val();
		data.memo = form.find('[name="memo"]').val();
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval(returnData.js_code);
	}

	// 우편번호 조회
	this.searchPost = function(tno){
		tno = tno.toString();

		var findStr = "FB";

		if( tno.length == 22 ){
			var url = "https://www.freshsolutions.co.kr/main/delivery_check.php?invoice_no="+tno;
		}else if (tno.indexOf(findStr) != -1) {
			var url = "http://www.fastbox.co.kr/DHUB/tracking.php?fb_invoice_no="+tno+"&lang=US";
		}else if (tno.substr(0,2) == 'MR' || tno.substr(0,2) == 'mr') {
			var url = "https://system.mirglobal.co.kr/Track/Result?mode=0&ids="+tno;
		}else{
			var url = "https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo="+tno;
		}
		window1 = window.open(url,'','width=1300,height=800,status=0,scrollbars=1');
	}

	// 주문취소
	this.orderCancel = function(ordername,orderno,passwd){
		if( !confirm('주문을 취소하시겠습니까?') ){
			return false;
		}

		var returnBasket = confirm('구매 취소 후 상품목록을 장바구니로 담으시겠습니까?');
		var form = $(this.form_obj);
		var data = new Object();
		data.method = 'orderCancel';

		// 장바구니 롤백 여부
		data.string = returnBasket;

		// 기본폼정보
		if( !ordername ){
			data.ordername = form.find('[name="ordername"]').val();
		}else{
			data.ordername = ordername;
		}

		if( !orderno ){
			data.orderno = form.find('[name="orderno"]').val();
		}else{
			data.orderno = orderno;
		}

		if( !passwd ){
			data.passwd = form.find('[name="passwd"]').val();
		}else{
			data.passwd = passwd;
		}

		// 예금주
		data.return_type = form.find('[name="return_type"]:checked').val();
		data.bank = form.find('[name="bank"]').val();
		data.bank_name = form.find('[name="bank_name"]').val();
		data.bank_num = form.find('[name="bank_num"]').val();

		// 계좌등록 여부
		data.refund_ins = form.find('[name="refund_ins"]').val();

		// 외부키
		data.khash = form.find('[name="khash"]').val();

		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval(returnData.js_code);
	}

	// 주문취소
	this.cancelMerge = function(orderno){
		var data = new Object();
		data.method = 'orderCancel';
		data.orderno = orderno;
		data = JSON.stringify(data);
		data.string = false; // 삭제 후 장바구니 복구

		// 취소
		var returnData = this.ajax(data);
	}

	// 장바구니 복사
	this.copyBasket = function(market_idx){
		var data = new Object();
		data.method = 'copyBasket';
		data.market_idx = market_idx;
		data = JSON.stringify(data);

		// 취소
		return this.ajax(data);
	}


	// 주문취소 프로세스
	this.orderCancelProc = function(){
		var error = false;

		if( $('input[name="return_type"]:checked').val() == '2' ){
			$('#orderForm .required').each(function(){
				if( $.trim($(this).val()) == '' ){
					alert($(this).data('required_msg')+' 입력해주세요');
					$(this).focus();
					error = true;
					return false;
				}
			});
		}

		if( error ){
			return false;
		}

		// 실제 취소
		this.orderCancel();
	}

	// 주문취소 페이지( 무통장일 경우 환불계좌 받아야함
	this.orderCancelPage = function(ordername,orderno,passwd){
		var form = $(this.form_obj);

		// 기본폼정보
		if( ordername ){
			form.find('[name="ordername"]').val(ordername);
		}

		if( orderno ){
			form.find('[name="orderno"]').val(orderno);
		}

		if( passwd ){
			form.find('[name="passwd"]').val(passwd);
		}


		$(this.form_obj).attr('action','/member/order_cancel.php');
		$(this.form_obj).submit();

		$(this.form_obj).attr('action','');
	}

	// 현금영수증
	this.cashReceipt = function(){
		window.open('','cashReceipt','width=650,height=450');

		$(this.form_obj).attr('action','/pg/inipay/receipt/sample/INIreceipt_view.php').attr('target','cashReceipt');
		$(this.form_obj).submit();

		$(this.form_obj).attr('action','').attr('target','');
	}

	this.leftsPgShow = function(index_no){
		CookieProc.delCookie('buymethod');

		$('#pgDiv #pgId').val(index_no);
		$('#pgDiv').show();
	}

	this.cartChange = function(){
		var obj = $(event.target||event.srcElement);
		var form = obj.closest('form');

		if( form.find('[name="change_op1"]').length <= 0 ){
			alert('옵션변경이 불가능한 상품입니다.');
			return false;
		}

		if( form.find('[name="change_op1"]').length > 0 ){
			if( !form.find('[name="change_op1"] option:selected').val()){
				alert('옵션을 선택해주세요');
				form.find('[name="change_op1"]').focus();
				return false;
			}
		}

		if( form.find('[name="change_op2"]').length > 0 ){
			if( !form.find('[name="change_op2"] option:selected').val()){
				alert('옵션을 선택해주세요');
				form.find('[name="change_op2"]').focus();
				return false;
			}
		}

		if( !confirm('해당 옵션으로 변경하시겠습니까?' )){
			return false;
		}

		var idx = form.find('[name="cart_idx"]').val();
		var op1 = form.find('[name="op1"]').val();
		var op2 = form.find('[name="op2"]').val();
		var change_op1 = form.find('[name="change_op1"]').val();
		var change_op2 = form.find('[name="change_op2"]').val();

		var data = new Object();
		data.method = 'cartChange';
		data.string = '';
		data.idx = idx;
		data.op1 = op1;
		data.op2 = op2;

		data.change_op1 = change_op1;
		data.change_op2 = change_op2;

		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		eval(returnData.js_code);
	}

	// 옵션여부
	this.changeType = function(obj){
		if( $(obj).val() == 4 || $(obj).val() == 1 ){ // 교환이나 옵션변경만
			$(obj).closest('tr').find('[name="op1[]"],[name="op2[]"]').show();
		}else{
			$(obj).closest('tr').find('[name="op1[]"],[name="op2[]"]').val('').hide();
		}

		if( $(obj).val() != '' ){
			$(obj).closest('tr').find('[name="claim_reason[]"]').show();
		}else{
			$(obj).closest('tr').find('[name="claim_reason[]"]').val('').hide();
		}
	}

	// 낱개 신청으로 변경
	this.basketExplode = function(basket_idx){
		if( !confirm('낱개 신청으로 변경하시겠습니까?')){
			return false;
		}

		var data = $(this.form_obj).serializeArray();

		var datas = new Array();
		$.each(data,function(idx,item){
			datas.push('"'+item.name+'":'+'"'+item.value+'"');
		});

		datas.push('"basket_idx":"'+basket_idx+'"');
		datas.push('"method":"basketExplode"');

		datas = '{'+datas.join(',')+'}';

		var returnData = this.ajax(datas);
		eval(returnData.js_code);
	}

	// 취소,변겨엥 상품추가 로직
	this.changeAddGoods = function(){
		var code = prompt("원하시는 상품의 상품코드를 입력해주세요.\n상품명의 맨앞 영문+숫자조합의 코드 입니다.\nex)cd1162,sk2900");

		if( code ){
			var data = GoodsProc.getGoods(code);

			if( !data ){
				alert('상품코드를 확인해주세요');
				return false;
			}

			var html = $('.ord_list tbody tr:first').clone();
				html.find('input,select').remove();

				// 선택타입글자
				html.find('td:first').text("상품추가");

				// 이미지 변경
				html.find('img').attr('src','https://atimg.sonyunara.com/files/attrangs/goods/'+data.index_no+'/'+data.simg14);

				// 상품명 변경
				html.find('.name').text(data.gname);

				// 금액변경
				html.find('.price').text(this.number_format(data.real_account));

				// 수량 1개 고정
				html.find('.price').next('td').html("<select><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option></select>");

			$('.ord_list tbody').append(html);
		}
	}

	this.returnIgnoreMsg = function(){
		alert("이 주문건은 현재 상품변경/개별취소 신청 불가합니다.\n\n주문서에 대한 상품변경/취소는 번거로우시더라도\n아뜨랑스 1:1 문의게시판으로 문의 부탁드립니다.");
	}
}

// 기본클래스 생성
var OrderProc = new OrderProc();