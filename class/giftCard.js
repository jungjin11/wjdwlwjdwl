function giftCardProc(){
	this.ajaxUrl = "/class/giftCard_ajax.php";

	this.submitCheck = function(){
		this.buy();
		return false;
	}

	this.buy = function(){
		var form = $(event.target||event.srcElement).closest('form');

		// 자기가 사는거는 수신자번호 주문자 번호로 맞춤
		if( form.find('[name="type"]').val() == '2' ){
			form.find('[name="receive_name"]').val(form.find('[name="send_name"]').val());
			form.find('[name="receive_cp[]"]:eq(0)').val(form.find('[name="send_cp[]"]:eq(0)').val());
			form.find('[name="receive_cp[]"]:eq(1)').val(form.find('[name="send_cp[]"]:eq(1)').val());
			form.find('[name="receive_cp[]"]:eq(2)').val(form.find('[name="send_cp[]"]:eq(2)').val());
		}

		var buymethod = form.find('[name="buymethod"]:checked').val();

		form.removeAttr('action');

		switch( buymethod ){
			case 'K':
				form.attr('action','/pg/kakaopay/kakao_giftCard.php');
				form.submit();
				break;
			default:
				var url = "/pg/inipay/sample/giftCardPayForm.php";

				$.ajax({
					url:url,
					type:'post',
					data:form.serialize(),
					async:false,
					success:function(html){
						$('#pgArea').empty().append(html);
						INIStdPay.pay('payForm');
					}
				});
				break;
		}
	}

	this.codeSubmitCheck = function(){
		//var form = $(event.target||event.srcElement).closest('form');
		this.codeSubmit();
		return false;
	}

	this.codeSubmit = function(){
		var form = $(event.target||event.srcElement);

		var data = {};
		data.method = 'useCode';
		data.string = form.serialize();

		$.ajax({
			url:this.ajaxUrl,
			type:'post',
			aysnc:false,
			data:data,
			success:function(code){
				if(code){
					eval(code);
				}
			}
		});
	}

	this.nextFocus = function(){
		var returnKey = [9,16,8,46]; // delete,tabe,shift,backspace

		if( returnKey.indexOf(event.keyCode) > -1){
			return;
		}

		var obj = $(event.target||event.srcElement);
		if( obj.val().length == 4 ){
			obj.next('input').focus();

		}
	}
}

// 기본클래스 생성
var giftCardProc = new giftCardProc();