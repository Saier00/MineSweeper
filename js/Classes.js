let mineClickedClass="mineClicked";
let mineClass="mine";
let flagClass="flag";
let emptyClass="empty";
let numberedClassPrefix="numbered";
let squareClass="square";

let mines=[];
let end=false;

let flags={
	//<summary>number of flags placed</summary>
	placed:0,
	//<summary>number of mines marked by flags</summary>
	toWin:0,
	mines:0,

	setAmountOfMines(m){
		this.toWin=m;
		this.mines=m;
		this.placed=0;
	},

	add(mine){
		this.placed++;
		if(mine){
			this.toWin--;
			if(this.toWin==0&&this.placed==this.mines)
				win();
		}
	},

	remove(mine){
		this.placed--;
		if(mine)
			this.toWin++;
	}
}

function addClassNames(obj){
	({mineClickedClass="mineClicked",mineClass="mine",emptyClass="empty",numberedClassPrefix="numbered",squareClass="square", flagClass="flag"}=obj);
}
//<summary>intarface for squares on field</summary>
class Square{
	//<summary>number of mines around the square</summary>
	mines=0;
	//<summary>square's html-element</summary>
	_square=null;
	flagged=false;

	set square(value){
		if(value!=null)
			this._square=value;
	}
	get square(){
		return this._square;
	}

	//<summary>onleftclick square's html-element event's function</summary>
	check(){}
	//<summary>onrightclick square's html-element event's function</summary>
	flag(e){
		e.preventDefault();
	}
	//<summary>function for calling neighbour squares to open
	//them or show number of mines around</summary>
	call(){}
}

class Mine extends Square{
	constructor(){
		super();

		mines.push(this);
	}

	check(){
		super.check();
		if(!end){
			this.square.className=mineClickedClass;

			let ind=mines.indexOf((el)=>el===this);
			if(ind>-1){
				mines.splice(ind,1);
			}
			lose();
		}
		else{
			this.square.classList.add(mineClass);
			this.square.classList.remove(flagClass);
		}
	}

	flag(e){
		super.flag(e);

		if(!this.flagged){
			this.flagged=true;
			this.square.classList.add(flagClass);
			flags.add(true);
		}
		else
		{
			this.flagged=false;
			this.square.classList.remove(flagClass);
			flags.remove(true);
		}
	}
}

class Empty extends Square{
	//<summary>left, up, right and down neigbour squares</summary>
	neighbours=new Set();

	check(){
		super.check();
		this.call=super.call;
		this.check=super.check;
		this.flag=super.flag;
		if(this.mines!=0)
			this.square.classList.add(numberedClassPrefix+this.mines);
		else
			for(let nghb of this.neighbours)
				nghb.call();

		this.square.classList.remove(squareClass);
		this.square.classList.add(emptyClass);

		if(this.flagged){
			this.flagged=false;
			this.square.classList.remove(flagClass);
			flags.remove(false);
		}
	}

	call(){
		super.call();
		if(this.mines!=0){
			this.call=super.call;
			this.check=super.check;
			this.flag=super.flag;
			
			this.square.classList.remove(squareClass);
			this.square.classList.add(emptyClass);
			this.square.classList.add(numberedClassPrefix+this.mines);

			if(this.flagged){
				this.flagged=false;
				this.square.classList.remove(flagClass);
				flags.remove(false);
			}
		}
		this.check();
	}

	flag(e){
		super.flag(e);

		if(!this.flagged){
			this.flagged=true;
			this.square.classList.add(flagClass);
			flags.add(false);
		}
		else
		{
			this.flagged=false;
			this.square.classList.remove(flagClass);
			flags.remove(false);
		}
	}
}

function lose(){
	end=true;
	
	mines.forEach((el)=>el.check());

	alert("Defeat!");

	blockField();
}

function win(){
	alert("Win!");

	blockField();
}

function blockField(){
	let f=document.getElementById(field.targetId);
	f.classList.add("blocked");
}