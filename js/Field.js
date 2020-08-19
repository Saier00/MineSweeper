//<summary>playing field</summary>
let field={
	//<summary>field's dimensions</summary>
	x:600,
	y:600,
	//<summary>number of squares along x- and y-axis</summary>
	sqsX:20,
	sqsY:20,
	mines:40,
	targetId:"field",
	fieldClass:"field",

	changeFieldProperties(obj){
		for(let p of ["x","y","sqsX","sqsY","mines","targetId","fieldClass"])
		{
			if(obj[p]!==undefined)
				this[p]=obj[p];
		}
	},

	buildField(){
		this.postValidation();

		let f = document.getElementById(this.targetId);
		f.classList.add(this.fieldClass);
		f.classList.remove("blocked");
		end=false;
		f.style.width=this.x+"px";
		f.style.height=this.y+"px";

		f.innerHTML="";
		f.append(this.build());

		this.bindSqs(f.querySelectorAll("."+squareClass));
	},
};

//<summary>validates field's fields</summary>
field.postValidation=postValidation;

function postValidation(){
	if(this.sqsX*this.sqsY<this.mines)
		throw new Error("At least one of the squares must be empty");
	if(this.sqsX<=0&&this.sqsY<=0)
		throw new Error("Number of the squares can't b less than 0");
	if(this.x<=0&&this.y<=0)
		throw new Error("Field dimensions can't be less than 0");
}

//<summary>builds the playing field</summary>
//<return>a DOM-element</return>
field.build=buildTable;

function buildTable(){
	let table = document.createElement("table");
	table.style.width=this.x+"px";
	table.style.height=this.y+"px";
	for(let i=0;i<this.sqsY;i++){
		let tr=document.createElement("tr");
		for(let k=0;k<this.sqsX;k++)
		{
			let td=document.createElement("td");
			td.classList.add(squareClass);
			tr.append(td);
		}
		table.append(tr);
	}
	return table;
}

//<summary>creates the empty squares, mines and walls objects, 
//bind them to existing DOM-elements of squares</summary>
field.bindSqs=bindingAlgRowEvenly;

//<summary>fills every row with a mine from the first to the last</summary>
function bindingAlgRowEvenly(sqs){
	flags.setAmountOfMines(field.mines);

	for(let y=0; y<field.sqsY;y++){
		for(let x=0;x<field.sqsX;x++){
			//the first clicked square can't be a mine
			sqs[(y*field.sqsX)+x].addEventListener("click",function firstTurn(){
				if(turn!=null){
					turn(x,y);
					turn=null;
				}
				else{
					sqs[(y*field.sqsX)+x].removeEventListener("click",firstTurn);
				}
			});
		}
	}

	function turn(cx,cy){
		let m=new Array(this.sqsY);

		for(let y=0;y<field.sqsY;y++)
			m[y]=(new Array(field.sqsX)).fill(false);

		let minesPlaced=0;
		while(minesPlaced!=field.mines){
			for(let y=0; y<field.sqsY&&minesPlaced<field.mines;y++,minesPlaced++){
				let x=Math.floor(Math.random()*(field.sqsX+1));
				while(m[y][x]==true||(cx==x&&cy==y))
					x=Math.floor(Math.random()*(field.sqsX+1));
				m[y][x]=true;
			}
		}

		for(let y=0; y<field.sqsY;y++){
			for(let x=0;x<field.sqsX;x++){
				if(m[y][x]==true)
					m[y][x]=new Mine();
				else
					m[y][x]=new Empty();
				m[y][x].square=sqs[(y*field.sqsX)+x];
			}
		}

		for(let y=0; y<field.sqsY;y++){
			for(let x=0;x<field.sqsX;x++){
				let temp;
				if(y==0)
					temp=m.slice(0,2);
				else if(y==field.sqsY-1)
					temp=m.slice(field.sqsY-2,field.sqsY);
				else
					temp=m.slice(y-1,y+2);

				if(x==0)
					temp.forEach((item, index, array)=>array[index]=item.slice(0,2));						
				else if(x==field.sqsX-1)
					temp.forEach((item, index, array)=>array[index]=item.slice(field.sqsX-2,field.sqsX));
				else
					temp.forEach((item, index, array)=>array[index]=item.slice(x-1,x+2));
				
				for(let t of temp)
					for(let sq of t)
						if(sq instanceof Mine)
							m[y][x].mines++;

				if(m[y][x] instanceof Empty){
					if(y!=0)
						m[y][x].neighbours.add(m[y-1][x]);
					if(x!=0)
						m[y][x].neighbours.add(m[y][x-1]);
					if(y!=field.sqsY-1)
						m[y][x].neighbours.add(m[y+1][x]);
					if(x!=field.sqsX-1)
						m[y][x].neighbours.add(m[y][x+1]);
				}

				if(!(x==cx&&y==cy)){
					sqs[(y*field.sqsX)+x].addEventListener("click",()=>m[y][x].check());
					sqs[(y*field.sqsX)+x].addEventListener("contextmenu",(e)=>m[y][x].flag(e));
				}
			}
		}

		m[cy][cx].check();
	}
}
