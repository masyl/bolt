#pragma strict

function Start () {

}

function Update () {

	if (Input.GetKeyUp(KeyCode.Equals)) ZoomCamera(0.5);
	if (Input.GetKeyUp(KeyCode.Plus)) ZoomCamera(0.5);
	if (Input.GetKeyUp(KeyCode.Minus)) ZoomCamera(2);

}

function ZoomCamera (ratio : float)
{
	Debug.Log("Zooming camera! " + ratio);
	var cam : Camera = GetComponent(Camera);
	cam.orthographicSize = cam.orthographicSize * ratio;
}

