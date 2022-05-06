'use strict';

const e = React.createElement;

class Square extends React.Component {
  constructor(props) {
    super(props);
	const {selectedNumber, color} = this.props;
  }

  render() {
    return e(
      'div',
      { 
	  class: 'square',
	  style: {backgroundColor: this.props.color},
	  onClick: () => {this.props.onClick();}
	  },
	  this.props.selectedNumber
    );
  }
}

class SquareContainer extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
	  const squareContainer = new Array(9)
	  for (let j = 0; j < 9; j++){
		  squareContainer.push(e(Square,
								  {
									  selectedNumber: this.props.logicBoard[j + this.props.i*9].number,
									  color: this.props.logicBoard[j + this.props.i*9].flashHint ? '#ffff80' : 
											 (!this.props.logicBoard[j + this.props.i*9].rowConflict && 
											  !this.props.logicBoard[j + this.props.i*9].columnConflict &&
											  !this.props.logicBoard[j + this.props.i*9].squareConflict) ? 
											  'White' : 'LightPink',
									  onClick: () => {this.props.onClick(this.props.i, j);}
								  },
								  ));
	  }
	  return e('div', {
				class: 'square-container'}, 
				squareContainer)
  }
}

class NumberButton extends React.Component {
  constructor(props) {
    super(props);
	const {i, numberPadProperties} = this.props;
	this.state = {hover: false};
  }
  
  render() {
	  return e('button',
				{
					class: 'numbers',
					style: {backgroundColor: this.props.numberPadProperties[this.props.i].isClicked ? 
											 'CornflowerBlue' : 
											 (this.state.hover ? 'CornflowerBlue' : 'AliceBlue'),
					},
					onClick: () => this.props.onClick(this.props.i),
					onMouseEnter: () => {this.setState({hover: true})},
					onMouseLeave: () => {this.setState({hover: false})},
				},
				this.props.i+1
				);
	}
}	

class GameBoard extends React.Component {
  constructor(props) {
    super(props);
	this.state = {selectedNumber: '', color: 'White', logicBoard: new Array(81).fill(''), numberPadProperties: new Array(9).fill(''), milliseconds: 0, timerIntervalID: null, solution: null};
	const square = {number: '', rowConflict: false, columnConflict: false, squareConflict: false, locked: false, flashHint: false};
	const number = {isClicked : false};
	for (let i = 0; i < this.state.logicBoard.length; i++){
		this.state.logicBoard[i] = Object.create(square);
	};
	for (let i = 0; i < this.state.numberPadProperties.length; i++){
		this.state.numberPadProperties[i] = Object.create(number);
	};
  }
  
  startTime(){
	  var timerIntervalID = setInterval( () => this.setState({milliseconds: this.state.milliseconds+1000}), 1000 ); 
	  this.setState({milliseconds: 0, timerIntervalID: timerIntervalID});
  }
  
  stopTime(){
	  clearInterval(this.state.timerIntervalID);
	  this.setState({timerIntervalID: null});
  }
  
  checkSquare(slot, square){
	  for (let i = square*9; i < (square+1)*9; i++){
		  const number = this.state.logicBoard[i].number;
		  this.state.logicBoard[i].squareConflict = false;
		  for (let j = square*9; j < (square+1)*9; j++){
			  if (i == j) continue;
			  if (this.state.logicBoard[j].number != '' && this.state.logicBoard[j].number == number){
				  this.state.logicBoard[i].squareConflict = true;
			  }
		  }
	  }
  }
  
  checkRow(slot, square){
	  const squareStart = 3*Math.floor(square/3);
	  const rowStart = 3*Math.floor(slot/3);
	  for (let i = squareStart; i < squareStart+3; i++){
		  for (let j = rowStart; j < rowStart+3; j++){
			  const number = this.state.logicBoard[j + i*9].number;
			  this.state.logicBoard[j + i*9].rowConflict = false;
			  for (let k = squareStart; k < squareStart+3; k++){
				for (let l = rowStart; l < rowStart+3; l++){
					if ((j + i*9) == (l + k*9)) continue;
					if (this.state.logicBoard[l + k*9].number != '' && this.state.logicBoard[l + k*9].number == number){
						this.state.logicBoard[j + i*9].rowConflict = true;
					}
				}
			  }
		  }
	  }
  }
  
  checkColumn(slot, square){
	  const squareStart = square % 3;
	  const rowStart = slot % 3;
	  for (let i = squareStart; i < squareStart+7; i += 3){
		  for (let j = rowStart; j < rowStart+7; j += 3){	
			const number = this.state.logicBoard[j + i*9].number;	
			this.state.logicBoard[j + i*9].columnConflict = false;	
			for (let k = squareStart; k < squareStart+7; k += 3){
				for (let l = rowStart; l < rowStart+7; l += 3){
					if ((j + i*9) == (l + k*9)) continue;
					if (this.state.logicBoard[l + k*9].number != '' && this.state.logicBoard[l + k*9].number == number){
						this.state.logicBoard[j + i*9].columnConflict = true;
					}					
				}
			}
		  }
	  }
  }
  
  checkBoard(slot, square){
		this.checkSquare(slot, square);
		this.checkRow(slot, square);
		this.checkColumn(slot, square);
		return (this.state.logicBoard[slot + square*9].rowConflict || this.state.logicBoard[slot + square*9].columnConflict || this.state.logicBoard[slot + square*9].squareConflict)
  }
  
  checkSquareValid(slot, square, number){
	for (let i = square*9; i < (square+1)*9; i++){
		if (this.state.logicBoard[i].number != '' && this.state.logicBoard[i].number == number){
			return false;
		}
	}
	return true;
}
	checkRowValid(slot, square, number){
	  const squareStart = 3*Math.floor(square/3);
	  const rowStart = 3*Math.floor(slot/3);
	  for (let i = squareStart; i < squareStart+3; i++){
		  for (let j = rowStart; j < rowStart+3; j++){
				if (this.state.logicBoard[j + i*9].number != '' && this.state.logicBoard[j + i*9].number == number){
					return false;
				}
			}
		}
		return true;
	}
	
	checkColumnValid(slot, square, number){
	const squareStart = square % 3;
	const rowStart = slot % 3;
	for (let i = squareStart; i < squareStart+7; i += 3){
		for (let j = rowStart; j < rowStart+7; j += 3){	
			if (this.state.logicBoard[j + i*9].number != '' && this.state.logicBoard[j + i*9].number == number){
				return false;
			}					
		}
	}
	return true;
  }
  
  checkValid(slot, square, number){
	return (this.checkSquareValid(slot, square, number) && this.checkColumnValid(slot, square, number) && this.checkRowValid(slot, square, number));
  }
  
  generateRandomSudoku(){
	  let filled = 0;
	  this.fullResetBoard();
	  this.setState({solutions: new Array()});
	  while (filled <= 15){
		let randIndex = Math.floor(Math.random()*81);
		let randFill = Math.floor(Math.random()*9)+1;
		if (this.state.logicBoard[randIndex].number == '' && this.checkValid(randIndex%9, Math.floor(randIndex/9), randFill)){
			this.state.logicBoard[randIndex].number = randFill;
			this.state.logicBoard[randIndex].locked = true;
			filled++;
		}
	  }
	  if (!this.solveSudoku()) this.generateRandomSudoku();
	  this.resetBoard();
	  
  }
  
  solveSudoku(){
	let index = this.state.logicBoard.findIndex(square => square.number == '');
	while (index != -1){
		for (let solution = 1; solution <= 9; solution++){
			if (this.checkValid(index%9, Math.floor(index/9), solution)){
				this.state.logicBoard[index].number = solution;
				if (this.solveSudoku()) return true;
			}
			this.state.logicBoard[index].number = '';
		}
		return false;
	}
	this.setState({solution: this.state.logicBoard.slice()})
	return true;
  }
  
  fullResetBoard(){
	const square = {number: '', rowConflict: false, columnConflict: false, squareConflict: false, locked: false};
	for (let i = 0; i < this.state.logicBoard.length; i++){
		this.state.logicBoard[i] = Object.create(square);
	}
	this.setState({selectedNumber: this.state.selectedNumber});
  }
  
  getHint(){
	let unfilled = this.state.logicBoard.filter(square => square.number == '');
	if (unfilled.length > 25){
		let index = Math.floor(Math.random() * 81);
		while (this.state.logicBoard[index].number != '') {
			index = Math.floor(Math.random() * 81);
		}
		this.state.logicBoard[index].flashHint = true;
		setTimeout(() => {this.state.logicBoard[index].flashHint = false}, 2000);
		this.state.logicBoard[index].number = this.state.solution[index].number;
	} else {
		let index = this.state.logicBoard.findIndex(square => square.number == '');
		this.state.logicBoard[index].flashHint = true;
		setTimeout(() => {this.state.logicBoard[index].flashHint = false}, 2000);
		this.state.logicBoard[index].number = this.state.solution[index].number;
	}
	

  }
  
  resetBoard(){
	const square = {number: '', rowConflict: false, columnConflict: false, squareConflict: false, locked: false};
	for (let i = 0; i < this.state.logicBoard.length; i++){
		if (this.state.logicBoard[i].locked) {
			this.state.logicBoard[i].rowConflict = false;
			this.state.logicBoard[i].columnConflict = false;
			this.state.logicBoard[i].squareConflict = false;
			continue;
		}
		this.state.logicBoard[i] = Object.create(square);
	}
	this.setState({selectedNumber: this.state.selectedNumber});
  }
  
  handleClick(i, j) {
	  if (this.state.selectedNumber == '' || this.state.logicBoard[j + i*9].locked) return;
	  this.setState({selectedNumber: this.state.selectedNumber});
	  this.state.logicBoard[j + i*9].number = this.state.selectedNumber;
	  this.checkBoard(j, i);
  }
  
  render() {
	  const gameBoard = new Array(9)
	  const numberPad = new Array(9)

	  for (let i = 0; i < 9; i++){
		  gameBoard.push(e(SquareContainer,
							  {
								  i: i,
								  logicBoard: this.state.logicBoard,
								  onClick: (i, j) => {this.handleClick(i, j);}
							  },
							  ));
		  numberPad.push(e(NumberButton, 
							{
								i: i,
								numberPadProperties: this.state.numberPadProperties,
								onClick: (i) => {
									for (let j = 0; j < 9; j++){
										if (j == i) continue;
										this.state.numberPadProperties[j].isClicked = false;
									}
									this.state.numberPadProperties[i].isClicked = !this.state.numberPadProperties[i].isClicked;
									this.setState({selectedNumber: this.state.numberPadProperties[i].isClicked ? i+1 : ''});
								}
							},
							));
	  }  
	  return e('div', {
				class: 'game'}, 
				gameBoard,
				e('div', {class: 'numpad'}, numberPad),
				e('button', {class: 'solveButton', onClick: () => {if (this.state.solution != null){ this.resetBoard(); this.setState({logicBoard: this.state.solution.slice()}); this.stopTime();}}}, "Solve"),
				e('button', {class: 'resetButton', onClick: () => {this.resetBoard()}}, "Reset"),
				e('button', {class: 'hintButton', onClick: () => {this.getHint()}}, "Hint"),
				e('button', {
								class: 'generateSudoku',
								onClick: () => {
									this.generateRandomSudoku();
									if (this.state.timerIntervalID != null){
										this.stopTime();
									}
									this.startTime();
								}
							}, 
							"Generate Sudoku"),
				e('div', {class: 'timer'}, 
				Math.floor(this.state.milliseconds/3600000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
				+ ':' + Math.floor(this.state.milliseconds/60000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) 
				+ ':' + Math.floor(this.state.milliseconds/1000).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false}) ))
  }
}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render(e(GameBoard));