function SiteProc(){
	// 파일경로
	this.classFileAddr = '/class/site_ajax.php'; // 해당파일 위치

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
		if( $.trim(data) ){
			data = JSON.parse(data);
			return data;
		}
	}

	this.boardLink = function(memindex){
		if( memindex > 0 ){
			location.href = '/member/qna_write.php';
		}else{
			location.href = '/member/write_no.php';
		}
	}

	this.traceLink = function(name,src){
		if( name ){
			var data = new Object();
			data.method = 'traceLink';
			data.name = name;
			data.src = src;
			data = JSON.stringify(data);

			this.ajax(data);
		}
	}

	this.inpm_adm_product = function(obj,goods_idx){
		var data = new Object();
		data.method = 'inpm_adm_product';
		data.goods_idx = goods_idx;
		data = JSON.stringify(data);

		var returnData = this.ajax(data);
		if( returnData.js_code ){
			eval(returnData.js_code);
		}
	}
	
	this.promotionCheck = function(id){
		var SendData = new Object();
		SendData.method = 'promotionCheck';

		var data = $.ajax({
			url:this.classFileAddr,
			type:'post',
			data:SendData,
			success:function(data){
				if( data ){
					$(id).addClass('on');
				}else{
					$(id).removeClass('on');
				}
			}
		});
	}
}

// 기본클래스 생성
var SiteProc = new SiteProc();