function toggleRelativeMode (value){
	switch(value){
		case MRM:
		case 'MRM':
		  RELATIVE_MODE = MRM;
		  break;
		case RMRM:
		case 'RMRM':
		  RELATIVE_MODE = RMRM;
		  break;
	}
}

function updateIterationText (value){
	document.getElementById("iterations_display").innerHTML = numberFormat(value) + " Iterations.";
}

function adjustAnimateSpeed (value){
	ANIMATE_SPEED = Math.round(value * 10);
}