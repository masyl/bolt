#pragma strict

var baseCameraSize = 1000;
var zoomRatio : float = 1;

function Start () {

}

function Update () {

	if (Input.GetKeyUp(KeyCode.Equals)) ZoomCameraBy(0.5);
	if (Input.GetKeyUp(KeyCode.Plus)) ZoomCameraBy(0.5);
	if (Input.GetKeyUp(KeyCode.Minus)) ZoomCameraBy(2);
	if (Input.GetKeyUp(KeyCode.Alpha0)) ZoomCameraTo(1);
	
}

function cameraSizeUpdate (newSize) {
	var cam : Camera = GetComponent(Camera);
	cam.orthographicSize = newSize;
}

function ZoomCameraBy (factor : float)
{
	Debug.Log("Zooming camera by " + factor + "x factor");
	zoomRatio = zoomRatio * factor;
	tweenCameraTo(baseCameraSize * zoomRatio);

}

function ZoomCameraTo (ratio : float)
{
	Debug.Log("Zooming camera to " + ratio + "x ratio");
	zoomRatio = ratio;
	tweenCameraTo(baseCameraSize * ratio);

}

function tweenCameraTo(value) {
	var cam : Camera = GetComponent(Camera);
	iTween.ValueTo(gameObject, iTween.Hash(
		"from", cam.orthographicSize,
		"to", value,
		"time", 0.5f,
		"onupdatetarget", gameObject,
		"onupdate", "cameraSizeUpdate",
		"easetype", iTween.EaseType.easeOutQuad
	));

}


