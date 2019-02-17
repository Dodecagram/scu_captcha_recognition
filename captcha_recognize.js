function getCaptcha(imgEle){
	let bool = imgEle == undefined;
	let canvas = document.createElement('canvas');
	canvas.setAttribute("width","180px");
	canvas.setAttribute("height","60px");
	let ctx = canvas.getContext('2d');
	let captcha;
	if(bool){
		captcha = new Image(180, 60);
	}else{
		captcha = imgEle;
	}
	return new Promise((resolve, reject)=>{
		let myImageData;
		if(bool){
			captcha.onload = function(){
				ctx.drawImage(captcha,0,0);
				myImageData = ctx.getImageData(0, 0, 180, 60);
				resolve(myImageData);
			}
			captcha.src = '/img/captcha.jpg';
		}else{
			ctx.drawImage(captcha,0,0);
			myImageData = ctx.getImageData(0, 0, 180, 60);
			resolve(myImageData);
		}
		
	});
}

function Data2Arr(imgData){
	let [width,height,data] = [imgData.width,imgData.height,imgData.data];
	let arr = new Array(height)
	for(let i=0; i<height; i++){
		arr[i] = new Array(width);
		for(let j=0; j<width; j++){
			arr[i][j] = new Array(3)
			let [r, g, b, a] = [data[4 * (i * width + j)], data[4 * (i * width + j) + 1], data[4 * (i * width + j) + 2], data[4 * (i * width + j) + 3]];
			[r, g, b] = [r * (a/255), g * (a/255), b * (a/255)];
			[arr[i][j][0], arr[i][j][1], arr[i][j][2]] = [r, g, b];
		}
	}
	return arr;
}

function Data2Arr_r(imgData){
	let arr = Data2Arr(imgData);
	return arr.map(x=>x.map(y=>y[0]));
}

function getNum(imgData){
	let img = Data2Arr(imgData);
	let width = imgData.width;
	let height = imgData.height;
	let img_i = img.map((i)=>{
		return i.map((j)=>{
			if((j[0] - (j[1]+j[2])/2) < 21){
				return [255,255,255];
			}else{
				return j;
			}
		})
	});
	
	let img_ii = img_i.map((i)=>{
		return i.map((j)=>{
			let j_cp = j.slice()
			if(j[0] >= 21){
				j_cp[0] = 255
			}
			return j_cp.map((k)=>{
				return k>200?255:k;
			})
		})
	});
	
	const Gaussian_kernel = [	[1, 4, 7, 4, 1],
								[4,16,26,16, 4],
								[7,26,41,26, 7],
								[4,16,26,16, 4],
								[1, 4, 7, 4, 1]
							].map(x=>x.map(y=>y/256));
	const MORPH_RECT = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
	let img_r = img_ii.map((i)=>{
		return i.map((j)=>{
			return 255 - j[1];
		})
	});
	let img_r_blur;
	let arr_temp = new Array(height - 4);
	for(let i=0; i<height-4; i++){
		arr_temp[i] = new Array(width - 4);
		for(let j=0; j<width-4; j++){
			arr_temp[i][j] = 0;
			for(let k=0; k<5; k++){
				for(let l=0; l<5; l++){
					arr_temp[i][j] += Gaussian_kernel[k][l] * img_r[i+k][j+l];
				}
			}
		}
	}
	img_r_blur = arr_temp;
	let img_opened;//暂时不写了
	return [img_r_blur, img_opened];
}

function Arr2Data(img){
	let height = img.length;
	let width = img[0].length;
	let arr_temp = new Array(height*width*4);
	for(let i=0; i<height; i++){
		for(let j=0; j<width; j++){
			let idx = 4*(i*width+j);
			[arr_temp[idx], arr_temp[idx+1], arr_temp[idx+2], arr_temp[idx+3]] = [img[i][j][0], img[i][j][1], img[i][j][2],255];
		}
	}
	return new ImageData(new Uint8ClampedArray(arr_temp), width, height);
}

function Arr_r2Data(img_r){
	let height = img_r.length;
	let width = img_r[0].length;
	let arr_temp = new Array(height*width*4);
	for(let i=0; i<height; i++){
		for(let j=0; j<width; j++){
			let idx = 4*(i*width+j);
			[arr_temp[idx], arr_temp[idx+1], arr_temp[idx+2], arr_temp[idx+3]] = [img_r[i][j], img_r[i][j], img_r[i][j],255];
		}
	}
	return new ImageData(new Uint8ClampedArray(arr_temp), width, height);
}

function resizePic(imgData,height=20,width=60){
	let sheight = imgData.height;
	let swidth = imgData.width;
	let canvas = document.createElement('canvas');
	canvas.setAttribute("width",swidth+"px");
	canvas.setAttribute("height",sheight+"px");
	let canvas_scale = document.createElement('canvas');
	canvas_scale.setAttribute("width",width+"px");
	canvas_scale.setAttribute("height",height+"px");
	let ctx = canvas.getContext('2d');
	let ctx_scale = canvas_scale.getContext('2d');
	ctx.putImageData(imgData, 0, 0);
	ctx_scale.drawImage(canvas,0, 0, width, height)
	return ctx_scale.getImageData(0, 0, width, height);
}

function findArea(img){
	let height = img.length;
	let width = img[0].length;
	let arr_temp = img[0].slice();
	for(let i=1; i<height; i++){
		arr_temp = arr_temp.map((val,idx)=>{
			return val + img[i][idx];
		})
	}
	let arr = [];
	arr_temp.map((val,idx)=>{
		if(val >=255){
			if(arr.length == 0){
				arr.push(idx);
				arr.push(width-1)
			}else{
				arr[1] = idx;
			}
		}
	});
	return arr;
}

function divArea(img){
	let [imgMin, imgMax] = findArea(img);
	img = img.map(x=>x.map(y=>y<50?0:y));
	let step = (imgMax - imgMin)/4;
	let idx = new Int32Array([imgMin, imgMin+step, imgMin+2*step, imgMin+3*step, imgMax]);
	let arr_temp = [];
	let arr_sum = img[0].slice();
	for(let i=1; i<img.length; i++){
		arr_sum = arr_sum.map((val,idx)=>{
			return val + img[i][idx];
		})
	}
	for(let i=0; i<3; i++){
		let index = idx[1+i];
		index = parseInt(index - parseInt(step/2));
		let arrx = [];
		for(let j=0; j<step; j++){
			let k = index + j;
			let pev = arr_sum[k-1];
			let pre = arr_sum[k];
			let time = pev>pre?(pev/(pre+0.01)):(pre/(pev+0.01));
			if(time>5 && (pev>100 || pre>100)){
				arrx.push([k,time]);
			}
		}
		arrx.push([idx[1+i],5]);
		for(let k=0; k<arrx.length; k++){
			if(arrx[k][0] - idx[1+i] <= 3 || idx[2+i] - arrx[k][0] <= 3){
				arrx[k][1] = 4
			}
		}
		arrx = arrx.sort((a,b)=>{b[1] - a[1]});
		arr_temp.push(arrx[0][0]);
	}
	return [imgMin, ...arr_temp, imgMax];
}

function showPic(imgData){
	let [res,res_opened] = getNum(imgData);
	let res_resize = resizePic(Arr_r2Data(res));
	let a = divArea(Data2Arr_r(res_resize));
	for(let i=0; i<4; i++){
		let imgData = Data2Arr_r(res_resize).map(x=>x.slice(a[i],a[1+i]+1));
		imgData = Arr_r2Data(imgData);
		let width = imgData.width;
		let height = imgData.height;
		let canvas = document.createElement('canvas');
		canvas.setAttribute("width",width+"px");
		canvas.setAttribute("height",height+"px");
		let ctx = canvas.getContext('2d');
		ctx.putImageData(imgData, 0, 0);
		document.body.appendChild(canvas);
	}
}

function changeShape(img_r,height = 20 ,width = 20){
	let sheight = img_r.length;
	let swidth = img_r[0].length;
	let rh = height - sheight;
	let rw = width - swidth;
	let t = parseInt(rh/2);
	let arr_temp = [...(new Array(t)).fill(0).map(x=>(new Array(swidth)).fill(0)),
	...img_r, ...(new Array(rh - t)).fill(0).map(x=>(new Array(swidth)).fill(0))];
	t = parseInt(rw/2);
	return arr_temp.map(x=>[...(new Array(t)).fill(0), ...x, ...(new Array(rw - t)).fill(0)]);
}

function divPic(imgData){
	let [res,res_opened] = getNum(imgData);
	let res_resize = resizePic(Arr_r2Data(res));
	let a = divArea(Data2Arr_r(res_resize));
	let arr = [];
	for(let i=0; i<4; i++){
		let img_r = Data2Arr_r(res_resize).map(x=>x.slice(a[i],a[1+i]+1));
		arr.push(changeShape(img_r));
	}
	return arr;
}

const labels = ['2', '3', '4', '5', '6', '7', '8', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'm', 'n', 'p', 'w', 'x', 'y'];

function relu(X){
	return X.map(x=>x>0?x:0)
}

function layer_i(img_r){
	let img_flatten = [];
	img_r.map(x=>{img_flatten = [...img_flatten, ...x]});
	let out = new Array(W1.length);
	for(let i=0; i<W1.length; i++){
		out[i] = W1[i].reduce((pev,pre,idx)=>pev+pre*img_flatten[idx]);
	}
	out = out.map((val,idx)=>val+b1[idx]);
	return relu(out);
}

function layer_ii(inX){
	let out = new Array(W2.length);
	for(let i=0; i<W2.length; i++){
		out[i] = W2[i].reduce((pev,pre,idx)=>pev+pre*inX[idx]);
	}
	out = out.map((val,idx)=>val+b2[idx]);
	return out;
}

function estimate_i(inX){
	let max = [inX[0],0];
	inX.map((x,idx)=>{max = x>max[0]?[x,idx]:max});
	return max[1];
}

function net(X){
	return layer_ii(layer_i(X));
}

function toTensor(img_r){
	return img_r.map(x=>x.map(y=>y/255));
}

function getLabels(imgData){
	let arr = divPic(imgData);
	let arr_num = [];
	for(let i in arr){
		arr_num.push(estimate_i(net(toTensor(arr[i]))));
	}
	for(let i in arr_num){
		arr_num[i] = labels[arr_num[i]];
	}
	return arr_num.join('');
}

