function BuyProc(){
	// 설정값
	this.country_weight = 30000; // 해외배송 기준값 3kg
	//결제
	// 필수 선택자
	this.basket_idxs_obj = '.basket_idxs_obj'; // 바스켓 번호 선택자
	this.member_point_obj = '.member_point_obj'; // 적립금 선택자
	this.member_deposit_obj = '.member_deposit_obj'; // 예치금 선택자
	this.coupon_obj = '.coupon_obj'; // 쿠폰 선택자
	this.sub_coupon_obj = '.sub_coupon_obj'; // 서브 쿠폰 선택자
	this.zip_obj = '.zip_obj'; // 우편번호 선택자( 산간비 구할때 씀)
	this.del_loc_obj = '.del_loc_obj'; // 국내배송,해외배송 구분 선택자
	this.area_code_obj = '.area_code_obj'; // 해외배송일 해당 area_code값
	this.use_account_obj = '.use_account_obj'; // 총결제금액 선택자
	this.buymethod_obj = '.buymethod_obj'; // 결제방법 선택자
	this.form_obj = '.form_obj'; // 결제 선택자
	this.bank_obj = '.bank_obj'; // 은행 선택자
	this.inname_obj = '.inname_obj'; // 입금자명 선택자
	this.indate_obj = '.indate_obj'; // 입금일 선택자

	// 비필수 선택자
	this.point1_discount_obj = '.point1_discount_obj'; // 총 적립금액 선택자
	this.point2_discount_obj = '.point2_discount_obj'; // 총 적립금액 선택자
	this.total_discount_obj = '.total_discount_obj'; // 총할인액 선택자
	this.is_th_del_obj = '.is_th_del_obj'; // 오늘출발 여부 선택자
	this.total_delaccount_obj = '.total_delaccount_obj'; // 총배송료 선택자
	this.delaccount_obj = '.delaccount_obj'; // 배송비 선택자
	this.delaccount_th_obj = '.delaccount_th_obj'; //  오늘출발배송료 선택자
	this.delaccount_out_obj = '.delaccount_out_obj'; // 산간비 선택자
	this.coupon1_discount_obj = '.coupon2_discount_obj'; // 상품할인쿠폰 선택자
	this.coupon2_discount_obj = '.coupon1_discount_obj'; // 배송쿠폰 선택자
	this.isplus_discount_obj = '.isplus_discount_obj'; // 하나더할인 금액 선택자
	this.memberDelZone_obj = '.memberDelZone_obj'; // 회원 저장 배송지 선택자
	this.save_point_obj = '.save_point_obj'; // 구매하면 적립될 적립금
	this.coupon_name_obj = '.coupon_name_obj'; // 메인쿠폰명칭 선택자
	this.sub_coupon_name_obj = '.sub_coupon_name_obj'; // 서브쿠폰명칭 선택자
	this.mileage_obj = '.mileage_obj'; // 상품리스트 마일리지 선택자
	this.period_sale_total = '.period_sale_total_obj';

	// 값변경용 임의 선택자
	this.totalGoods = '.total_goods_price_obj'; // 상품합계

	// 파일 경로
	this.classFileAddr = '/class/buy_ajax.php'; // 해당파일 위치

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

	this.calcul = function(){
		// 오늘출발+새벽배송+오늘의 픽업 합친기능 덮음 2020-05-11
		if( $('.th_del_type').val() == 'PART' ){
			if( $('.is_th_del_obj:checked').data('isdawn') == 'Y' ){
				$('#is_dawn').prop('checked',true);
			}else{
				$('#is_dawn').prop('checked',false);
			}

			if( $('.is_th_del_obj:checked').data('istoday') == 'Y' ){
				$('#is_today').prop('checked',true);
			}else{
				$('#is_today').prop('checked',false);
			}
		}

		if( $('input[name="is_dawn"]:checked').val() == 'A') {
			$('#dawnDeliBox').css('display','table-row');
		}else{
			$('#dawnDeliBox').css('display','none');
		}

		// 해외배송인데 오늘출발출고 할려는지{
			if( $(this.is_th_del_obj).filter(':checked').val() == 'Y' && $(this.del_loc_obj).filter(':checked').val() == '2' ){
				alert('해외배송은 오늘출발이 불가능합니다.');
				$(this.is_th_del_obj).eq(1).prop('checked',true);
				this.calcul();
				return false;
			}

		// }

		// 적립금 입력 및 검증 {
			var max_member_point = $.trim($(this.member_point_obj).data('max'))-0;
			var member_point = $.trim($(this.member_point_obj).val())-0;
			if( !member_point ){
				member_point = 0;
				$(this.member_point_obj).val(0);
			}

			// 숫자검증
			if( !$.isNumeric(member_point) ){
				alert('숫자만 입력 가능합니다.');
				$(this.member_point_obj).val(0).focus();
				BuyProc.calcul();
				return false;
			}

			// 최대치 넘어 갔는지
			if( member_point > max_member_point && member_point > 0){
				alert('적립금은 최대 '+this.number_format(max_member_point)+'원까지 사용 가능합니다.');
				$(this.member_point_obj).val(0).focus();
				BuyProc.calcul();
				return false;
			}

			// 앞 0 삭제
			$(this.member_point_obj).val($(this.member_point_obj).val()-0);
		// }


		// 예치금 입력 및 검증 {
			var max_member_deposit = $.trim($(this.member_deposit_obj).data('max'))-0;
			var member_deposit = $.trim($(this.member_deposit_obj).val())-0;
			if( !member_deposit ){
				member_deposit = 0;
				$(this.member_deposit_obj).val(0);
			}

			// 숫자검증
			if( !$.isNumeric(member_deposit) ){
				alert('숫자만 입력 가능합니다.');
				$(this.member_deposit_obj).val(0).focus();
				return false;
			}

			// 최대치 넘어 갔는지
			if( member_deposit > max_member_deposit ){
				alert('예치금은 최대 '+this.number_format(max_member_deposit)+'원까지 사용 가능합니다.');
				$(this.member_deposit_obj).val(0).focus();
				return false;
			}

			// 앞 0 삭제
			$(this.member_deposit_obj).val($(this.member_deposit_obj).val()-0);
		// }

		// 코인 입력 및 검증 {
			var max_member_coin = $.trim($('.member_coin_obj').data('max'))-0;
			var member_coin = $.trim($('.member_coin_obj').val())-0;
			if( !member_coin ){
				member_coin = 0;
				$('.member_coin_obj').val(0);
			}

			// 숫자검증
			if( !$.isNumeric(member_coin) ){
				alert('숫자만 입력 가능합니다.');
				$('.member_coin_obj').val(0).focus();
				return false;
			}

			// 최대치 넘어 갔는지
			if( member_coin > max_member_coin ){
				alert('코인은 최대 '+this.number_format(max_member_coin)+'원까지 사용 가능합니다.');
				$('.member_coin_obj').val(0).focus();
				return false;
			}

			// 앞 0 삭제
			$('.member_coin_obj').val($('.member_coin_obj').val()-0);
		// }


		// 해외배송일 경우 무게 체크
		if( $(this.del_loc_obj).filter(':checked').val() == 2 ){
			var data = new Object();
			data.method = 'getTotalWeight';
			data.string = $(this.basket_idxs_obj).val();
			data = JSON.stringify(data);

			var returnData = this.ajax(data);
			if( returnData.total_weight > this.country_weight ){
				// 배송타입 국내로 다시변경
				$(this.del_loc_obj).filter(':first').prop('checked',true);
				$('.delTypeBox').hide().eq(0).show();

				// 금액 다시계산
				this.calcul();

				// 알려줌
				alert("해외 배송 기준무게를 초과하였습니다.\n\n고객센터로 문의 부탁드립니다.");
				return false;
			}
		}

		// 데이터 넘겨줌 메소드와 기타 정보를
		var data = new Object();
		data.method = 'getSellPrice';

		// 추가정보
		var stringData = {};
		stringData['basket_idxs'] = $(this.basket_idxs_obj).val(); // tmp_basket.index_no
		stringData['coupon1'] = $(this.coupon_obj).filter(':checked').val(); // shop_coupon_mem.index_no 쿠폰
		stringData['coupon2'] = $(this.sub_coupon_obj).filter(':checked').val(); // shop_coupon_mem.index_no 쿠폰
		stringData['point1'] = member_point; // shop_member.mempoints 적립금
		stringData['point2'] = member_deposit; // shop_member.memaccounts 예치금
		stringData['thDel'] = $(this.is_th_del_obj).filter(':checked').val(); // 번개배송여부
		stringData['zip'] = $(this.zip_obj).val(); // 배송주소
		stringData['del_loc'] = $(this.del_loc_obj).filter(':checked').val(); // 1:국내배송, 2:해외배송
		stringData['area_code'] = $(this.area_code_obj).val(); // 해외배송시 국가 코드
		stringData['dawn'] = $('input[name="is_dawn"]:checked').val(); // 새벽배송 여부
		stringData['allToday'] = $('#allToday').val(); // 전체다 번개출고인지
 		stringData['coin'] = $('.member_coin_obj').val(); // 코인
		data.string = stringData;

		data = JSON.stringify(data);

		// viewClass.get_price()의 리턴데이터 목록 받아옴
		var returnData = this.ajax(data);

		// 비정상적인 접근은 리턴데이터가 없음
		if( !returnData ){
			location.reload();
			return false;
		}

		// 오늘출발 유효지역 아니면 넘김
		if( $('input[name="is_dawn"]:checked').val() == 'A' && returnData.del_account_dawn == -1 ){
			alert('새벽배송이 불가능한 지역입니다.');
			$(this.is_th_del_obj).eq(1).prop('checked',true);
			$('input[name="is_dawn"]:first').prop('checked',true);
			$('input[name="is_th_del"]:first').prop('checked',true);
			this.calcul();
			return false;
		}

		// 오늘출발 유효지역 아니면 넘김, 인천,경기도 추가 2022-06-15
		if( $('input[name="is_dawn"]:checked').val() == 'T' && ($('#del_addr1').val().substring(0,2) != '서울' && $('#del_addr1').val() != '') ){
		// if( $('input[name="is_dawn"]:checked').val() == 'T' && returnData.del_account_today == -1 ){
			alert('오늘도착 배송이 불가능한 지역입니다.');
			$('input[name="is_dawn"]:first').prop('checked',true);
			$('input[name="is_th_del"]:first').prop('checked',true);
			this.calcul();
			return false;
		}

		// 실결제금으로 유효성 검증
		if( returnData.use_account < 0 ){
			alert('남은 결제 금액을 확인해주세요.');
			$(this.member_point_obj).val(0);
			$(this.member_deposit_obj).val(0);
			$(this.coupon_obj).filter(':first').prop('checked',true).focus(); // 쿠폰 초기화
			this.calcul();
			return false;
		}

		// 메인 쿠폰썼는데 할인 금액이 없다면
		if( stringData['coupon1'] > 0 && (Number(returnData.coupon1_discount)+Number(returnData.coupon2_discount)) <= 0 ){
			if( returnData.buy_limit_error == 'Y' ){
				alert('선택하신 쿠폰은 선착순이 종료되었습니다.');
			}else{
				alert('선택하신 쿠폰은 적용이 불가능합니다.');
			}
			$(this.coupon_obj).filter(':first').prop('checked',true).focus(); // 쿠폰 초기화
			this.calcul(); // 금액다시계산
			return false;
		}

		// 서브 쿠폰썼는데 할인 금액이 없다면
		if( stringData['coupon2'] > 0 && (Number(returnData.sub_coupon1_discount)+Number(returnData.sub_coupon2_discount)) <= 0 ){
			alert('선택하신 쿠폰은 적용이 불가능합니다.');
			$(this.sub_coupon_obj).filter(':first').prop('checked',true).focus(); // 쿠폰 초기화
			this.calcul(); // 금액다시계산
			return false;
		}

		// 적립액
		$(this.save_point_obj).text(this.number_format(returnData.save_point));

		// 총금액
		$(this.use_account_obj).text(this.number_format(returnData.use_account)).data('account',returnData.use_account); // 전액 사용때문에 data에 임시저장

		// 상품쿠폰 할인내역
		$(this.coupon1_discount_obj).text(this.number_format(returnData.coupon1_discount));

		// 배송쿠폰 할인내역
		$(this.coupon2_discount_obj).text(this.number_format(returnData.coupon2_discount));

		// 적립금 할인내역
		$(this.point1_discount_obj).text(this.number_format(returnData.point1_discount));
		if( returnData.point1_discount > 0 ){
			$(this.point1_discount_obj).closest('tr').show();
		}else{
			$(this.point1_discount_obj).closest('tr').hide();
		}

		// 예치금 할인내역
		$(this.point2_discount_obj).text(this.number_format(returnData.point2_discount));
		if( returnData.point2_discount > 0 ){
			$(this.point2_discount_obj).closest('tr').show();
		}else{
			$(this.point2_discount_obj).closest('tr').hide();
		}

		// 코인 할인내역
		$('.coin_discount_obj').text(this.number_format(returnData.coin_discount));
		if( returnData.coin_discount > 0 ){
			$('.coin_discount_obj').closest('tr').show();
		}else{
			$('.coin_discount_obj').closest('tr').hide();
		}

		// 하나더 할인 할인내역
		$(this.isplus_discount_obj).text(this.number_format(returnData.isplus_discount));

		// 총 배송비 선택자
		$(this.total_delaccount_obj).text(this.number_format(returnData.del_account));

		// 기본배송비 선택자
		var del_account_ori = returnData.del_account-returnData.del_account_th-returnData.del_account_out; // 배송료-오늘출발배송비-산간비
		if( del_account_ori < 0 ){
			del_account_ori = 0;
		}
		$(this.delaccount_obj).text(this.number_format(del_account_ori));

		// 오늘출발배송료 선택자
		$(this.delaccount_th_obj).text(this.number_format(returnData.del_account_th));

		// 산간비 선택자
		$(this.delaccount_out_obj).text(this.number_format(returnData.del_account_out));

		// 총 할인내역
		$(this.total_discount_obj).text(this.number_format(returnData.total_discount2+returnData.period_sale_total));

		/*
		if( returnData.total_discount2 > 0 ){
			$(this.total_discount_obj).closest('tr').show();
		}else{
			$(this.total_discount_obj).closest('tr').hide();
		}
		*/


		// 실결제금이 없으면 무통장입금으로 변경해버림
		if( returnData.use_account == 0 ){
			if( $(this.buymethod_obj).val() != 'B' && CookieProc.getCookie('buymethod') != 'K'){
				this.chooseMethod('B');
			}
		}

		// 메인쿠폰명칭
		$(this.coupon_name_obj).text(returnData.coupon_name);

		// 서브쿠폰명칭
		$(this.sub_coupon_name_obj).text(returnData.sub_coupon_name);


		// 쿠폰쓰면 상품리스트 예상적립금 0원
		if( (returnData.total_discount) > 0 ){
			$(this.mileage_obj).each(function(){
				$(this).data('default',$(this).text());
				$(this).text(0);
			});
		}else{
			$(this.mileage_obj).each(function(){
				$(this).text($(this).data('default'));
			});
		}

		// 상품합계
		$(this.totalGoods).text(this.number_format(returnData.total_goods+returnData.period_sale_total+returnData.addac));

		// 기본할인 영역
		$(this.period_sale_total).text(this.number_format(returnData.period_sale_total));

		// 무료배송 추가 계산
		var addPrice = returnData.delaccount_member_std - (returnData.use_account-returnData.del_account);
		var minPrice = 50000; // 5만원 이상

		if( (returnData.use_account >= minPrice && returnData.del_account > 0) && $('input[name="is_dawn"]:checked').val() == '' ) {
			if( addPrice > 0 ){
				$('.add_price').text(this.number_format(addPrice)).closest('div').show();
			}else{
				$('.add_price').closest('div').hide();
			}
			$('.delfree').show();
			sessionStorage.setItem('delFreeShow','Y')
		}
	}

	// 1000원단위 체크
	this.pointCheck = function(obj){
		var obj = $(obj);
		var num = obj.val();

		if( num < 1000 && num != 0 ){
			obj.focus();
			obj.val(0);
			alert('적립금은 1,000원 이상부터 사용 가능합니다.');
		}

		/*
		if( num%100 > 0 ){
			obj.val( obj.val()-num%100 );
			alert('적립금 및 예치금은 100원 단위로 사용 가능합니다.');
			obj.focus();
		}
		*/

		this.calcul();
	}

	// 100원단위 적립금 체크
	this.depositCheck = function(obj){
		var obj = $(obj);
		var num = obj.val();

		/*
		if( num%100 > 0 ){
			obj.val( obj.val()-num%100 );
			alert('예치금은 100원 단위로 사용 가능합니다.');
			obj.focus();
		}
		*/

		this.calcul();
	}

	// 100원단위 코인 체크
	this.coinCheck = function(obj){
		var obj = $(obj);
		var num = obj.val();

		/*
		if( num%100 > 0 ){
			obj.val( obj.val()-num%100 );
			alert('코인은 100원 단위로 사용 가능합니다.');
			obj.focus();
		}
		*/

		this.calcul();
	}

	this.onlyNum = function(){
		var obj = $(event.target||event.srcElement);
		var num = $.trim($(obj).val())-0;
		if( !$.isNumeric(num) ){
			alert('숫자만 입력해주세요');
			obj.val('');
			$(obj).focus();
		}
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

	this.delZoneSelect = function(){ // 주문자 배송지 선택
		var obj = $(event.target||event.srcElement).find('option:selected');

		var zip1 = obj.data('zip1');
		var addr1 = obj.data('addr1');
		var addr2 = obj.data('addr2');
		var del_cp = obj.data('del_cp').split('-');
		var del_phone = obj.data('del_phone').split('-');
		var del_name = obj.data('del_name');
		if( del_name ){
			$('[name="del_name"]').val(del_name);
		}

		//$('[name="del_name"]').val();
		$('[name="del_zip"]').val(zip1);
		$('[name="del_addr1"]').val(addr1);
		$('[name="del_addr2"]').val(addr2);

		for(i=0; i<del_cp.length; i++){
			$('[name="del_cp[]"]').eq(i).val($.trim(del_cp[i]));
		}

		for(i=0; i<del_phone.length; i++){
			$('[name="del_phone[]"]').eq(i).val($.trim(del_phone[i]));
		}

		// 국내배송지로, 계산로직은 클릭시 다시 돌아감.
		$(this.del_loc_obj).eq(0).prop('checked',true);
		$('.delTypeBox').hide().eq(0).show();

		this.calcul();

		$(this.memberDelZone_obj).find('option:first').prop('selected',true);
	}

	this.deliOptCopy = function(){ // 주문자 정보와 동일
		var obj = $(event.target||event.srcElement);
		if( !obj.prop('checked') ){
			return false;
		}
		// 주문자 이름
		var name = $('[name="name"]').val();
		$('[name="del_name"]').val(name);

		// 주문자 전화번호
		var idx = 0;
		$('[name="phone[]"]').each(function(){
			$('[name="del_phone[]"]').eq(idx).val($(this).val());
			idx++;
		});

		// 주문자 휴대전화
		var idx = 0;
		$('[name="cp[]"]').each(function(){
			$('[name="del_cp[]"]').eq(idx).val($(this).val());
			idx++;
		});
	}

	this.deliChange = function(){ // 주소지 변경시 기본주소 다날리고 해외배송일 경우 추가금액 selectBox 나타냄
		var obj = $(event.target||event.srcElement);
		$('.delTypeBox').hide().eq(obj.val()-1).show();

		$('[name="del_addr2"]').prop('readonly',false);

		if( obj.val() == 1 ){
			$('#del_zip').val('');
			$('#del_addr1').val('');
			$('#del_addr2').val('');
		}

		if( obj.val() == 2 ){
			alert('해외배송시 메모사항에 현지 연락처를 꼭! 입력해주세요.');
		}

		this.calcul();
	}


	this.setAllPoint = function(){ // 포인트 전액사용
		var use_account = $(this.use_account_obj).data('account')-0;
		var member_point = $(this.member_point_obj).data('max')-0;

		var point = $(this.member_point_obj).val()-0;
		use_account += point;
		$(this.member_point_obj).val(0);

		if( use_account <= 0 ){
			alert('남은 결제금액이 없습니다.');
			return false;
		}

		if( member_point >= use_account ){
			$(this.member_point_obj).val(use_account);
		}else{
			$(this.member_point_obj).val(member_point);
		}

		this.pointCheck($(this.member_point_obj));
	}

	this.setAllAccount = function(){ // 포인트 전액사용
		var use_account = $(this.use_account_obj).data('account')-0;
		var member_account = $(this.member_deposit_obj).data('max')-0;

		var point = $(this.member_deposit_obj).val()-0;
		use_account += point;
		$(this.member_deposit_obj).val(0);

		if( use_account <= 0 ){
			alert('남은 결제금액이 없습니다.');
			return false;
		}

		if( member_account >= use_account ){
			$(this.member_deposit_obj).val(use_account);
		}else{
			$(this.member_deposit_obj).val(member_account);
		}

		this.depositCheck($(this.member_deposit_obj));
	}

	this.setAllCoin = function(){ // 포인트 전액사용
		var use_account = $(this.use_account_obj).data('account')-0;
		var member_coin = $('.member_coin_obj').data('max')-0;

		var coin = $('.member_coin_obj').val()-0;
		use_account += coin;
		$('.member_coin_obj').val(0);

		if( use_account <= 0 ){
			alert('남은 결제금액이 없습니다.');
			return false;
		}

		if( member_coin >= use_account ){
			$('.member_coin_obj').val(use_account);
		}else{
			$('.member_coin_obj').val(member_coin);
		}

		this.coinCheck($('.member_coin_obj'));
	}

	// 여기서부터 커스텀 함수 이 안에만 코딩하고 나머지 윗부분은 정말 신중하게 건드릴것{
		this.chooseMethod = function(method,restrict){ // 결제방법 선택
			var cookieMethod = CookieProc.getCookie('buymethod');

			if( cookieMethod && method != cookieMethod ){
				alert("카카오로만 결제가 가능합니다.\n다른 방법을 원하실 경우 상세페이지에서 구매버튼을 눌러주세요.");
				return false;
			}

			//var obj = $('[onclick="BuyProc.chooseMethod(\''+method+'\')"]');
			var obj = $(event.target||event.srcElement);

			//console.log(obj1);
			$(".tab_method").find('a').removeClass('active');
			//$('[onclick^="BuyProc.chooseMethod"]').removeClass('active');
			obj.addClass('active');

			$('input[name="buymethod"]').val(method);
			$('.choice strong').text("'"+obj.text()+"'");

			if( method == 'B' ){
				$('.tabcnt_method0').show();
			}else{
				$('.tabcnt_method0').hide();
			}

			// 아뜨랑스 결제페이지 커스텀 로직
			scroll_page();
		}

		this.deli_check = function(zip){
			var data = $.ajax({
				url:'/ajax_proc/deli_check.php',
				type:'post',
				async:false,
				data:{'zip':$('#del_zip').val()},
				success:function(code){
				}
			}).responseText;

			return data;
		}

		this.buy = function(){
			// 오늘출발배송 보는상태
			sessionStorage.setItem('delFreeShow','N');


			// 유효성 검증

			// 새벽배송이 체크되었다면
			if( $('#is_dawn').prop('checked') ){
				var obj = $('input[name="dawnMemo"]:checked');
				if( obj.length < 1 ){
					alert('수령방법을 선택해주세요');
					$(window).scrollTop( $('.tbl_order').offset().top -200);
					return false;
				}

				var passObj = obj.closest('div').find('.dawnMemoPasswd');

				if( passObj.length > 0 && passObj.val() == '' ){
					alert('비밀번호를 입력해주세요');
					passObj.focus();
					return false;
				}
			}
			if($("input[name=handmadeCheck]").filter(':checked').val()=='N'){
				alert('핸드메이드 예약배송 상품 교환 반품 취소 정책에 동의해주세요');
				$("input[name=handmadeCheck]").eq(0).focus();
				return false;
			}

			// 비회원 주문시 동의 체크
			if($("input[name=nm_agreement]").filter(':checked').val()=='F'){
				alert('비회원 구매 및 결제 개인정보 취급방침에 동의해주세요');
				return false;
			}

			var use_account = $(this.use_account_obj).data('account')-0;
			if( $(this.buymethod_obj).val() == 'B' && use_account > 0  ){
				if( $(this.bank_obj).find('option:selected').val() == '' ){
					alert('입금은행을 선택해주세요');
					$(this.bank_obj).focus();
					return false;
				}

				if( $.trim($(this.inname_obj).val()) == ''){
					alert('입금자명을 입력해주세요');
					$(this.inname_obj).focus();
					return false;
				}
			}

			if( $(this.buymethod_obj).val() == 'W' && use_account < 1000  ){ // 카카오페이 1000원부터 가능
				alert('카카오페이 결제는 1000원부터 가능합니다.');
				return false;
			}

			// 기본 필수값 검증
			var error = false;
			$('.required').each(function(){
				if( !$(this).val()){
					alert($(this).data('require_msg')+' 입력해주세요');
					$(this).focus();
					error = true;
					return false;
				}
			});

			if( error ){
				return false;
			}


			// 주소 검증
			if( $(this.del_loc_obj).filter(':checked').val() == '1' || $(this.del_loc_obj).length <	1 ){ // 국내배송
				if( !$('#del_zip').val() && $('#del_zip').length > 0 ){
					alert('우편번호를 입력해주세요');
					$('#del_zip').focus();
					return false;
				}

				if( !$('#del_addr1').val() && $('#del_addr1').length > 0 ){
					alert('주소를 입력해주세요');
					$('#del_addr1').focus();
					return false;
				}

				if( !$('#del_addr2').val() && $('#del_addr2').length > 0 ){
					alert('주소를 입력해주세요');
					$('#del_addr2').focus();
					return false;
				}
			}else{ // 해외배송
				if( !$(this.area_code_obj).val() ){
					$(this.area_code_obj).focus();
					alert('해외배송 국가를 선택해주세요');
					return false;
				}

				if( !$('#ozip1').val() && $('#ozip1').length > 0 ){
					alert('우편번호를 입력해주세요');
					$('#ozip1').focus();
					return false;
				}

				if( !$('#oaddr1').val() &&	$('#oaddr1').length > 0 ){
					alert('주소를 입력해주세요');
					$('#oaddr1').focus();
					return false;
				}

				if( !$('#oaddr2').val() &&	$('#oaddr2').length > 0 ){
					alert('주소를 입력해주세요');
					$('#oaddr2').focus();
					return false;
				}

				if( !$('#delivery_memo').val() && $('#delivery_memo').length > 0 ){
					alert('현지 연락처를 입력해주세요.');
					$('#delivery_memo').focus();
					return false;
				}
			}

			// 해외배송 국가 어디인지
			$('#country').val($('#area_code option:selected').text());

			// 택배 파업지역 체크
			if( this.deli_check($('#del_zip').val()) == 1 && $('#th_del_type').val() != '' && $('input[name="is_dawn"]:checked').val() == '' ){
				if(confirm("해당 배송지는 배송파업 지역이므로\n오늘도착(서울권), 새벽도착(그외) 배송방법을 추천드립니다.\n\n파업 지역 특성상 모든 물품이 준비될시 일괄 배송 됩니다.")){
					$('#is_dawn').prop('checked',true);
					$(window).scrollTop( $('.tbl_order').offset().top -200);
					$('#dawnboxLayout').focus();
					BuyProc.calcul();
					return false;
				}
			}

			/*
			// 택배파업 임시
			if( this.deli_check($('#del_zip').val()) == 1 && $('#th_del_type').val() != '' && $('input[name="is_dawn"]:checked').val() == '' ){
				alert("해당 주소지는 배송파업 지역이므로 자사 부담으로\n오늘의 픽업으로 대체하여 배송됩니다.");
			}
			*/

			// 한번더 확인
			if( !confirm("주문정보가 맞으며,\n주문하시겠습니까?") ){
				return false;
			}

			// 검증이 끝났으니 넘김
			$(this.form_obj).submit();
		}

		this.setShowRoom = function(){ // 주소지 쇼룸
			$('.delTypeBox').hide().eq(0).show();

			$('[name="del_zip"]').val('04072');
			$('[name="del_addr1"]').val('서울 성동구 청계천로 474 (하왕십리동, 모노퍼스 주상복합)');
			$('[name="del_addr2"]').val('1층 아뜨랑스 쇼룸').prop('readonly',true);

			this.calcul();
		}

		this.testSetting = function(){ // 테스트세팅
			$('input[name="name"]').val('아뜨재영');
			$('input[name="passwds"]').val('1234');
			$('input[name="phone[]"]').val('123');
			$('input[name="cp[]"]').eq(0).val('8501');
			$('input[name="cp[]"]').eq(1).val('3073');
			$('input[name="email"]').val('tfed1214@naver.com');

			$('#name_same').trigger('click');

			$('input[name="del_zip"]').val('04702');
			$('input[name="del_addr1"]').val('서울 성동구 청계천로 474 (하왕십리동, 왕십리 모노퍼스 주상복합)');
			$('input[name="del_addr2"]').val('2층 소녀나라(201호)');
		}

		this.testSetting2 = function(){ // 테스트세팅
			$('input[name="name"]').val('아뜨랑스');
			$('input[name="passwds"]').val('1234');
			$('input[name="phone[]"]').val('123');
			$('input[name="cp[]"]').eq(0).val('3737');
			$('input[name="cp[]"]').eq(1).val('4385');
			$('input[name="email"]').val('attrangs@naver.com');

			$('#name_same').trigger('click');

			$('input[name="del_zip"]').val('04702');
			$('input[name="del_addr1"]').val('서울 성동구 청계천로 474 (하왕십리동, 왕십리 모노퍼스 주상복합)');
			$('input[name="del_addr2"]').val('2층 소녀나라(202호)');
		}
	// 커스터 함수 끝.
}

// 기본클래스 생성
var BuyProc = new BuyProc();