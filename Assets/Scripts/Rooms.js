#pragma strict

var MovableLayer : GameObject;
var RoomPrefab : GameObject;
var scale : float = 1;
var cameraScaleOffset : float = 100;
var baseScale = 0.002;

function Start () {
	Debug.Log("Rooms script started!");

}

function Update () {

}


public function onRoomUpdated(room : Room)
{
	var roomID = "room:" + room.coord.address();
	Debug.Log("Room updated : " + room.coord.address());
	var sprite : GameObject = GameObject.Find(roomID);
	
	//todo: Show or hide doors
}

public function onRoomCreated(room : Room)
{
	var roomID = "room:" + room.coord.address();
	var roomObject : GameObject = Instantiate(RoomPrefab);
	roomObject.name = roomID;
	roomObject.transform.SetParent(MovableLayer.transform);
	roomObject.transform.localPosition = MovableLayer.transform.position;
	
	roomObject.transform.position.x = (parseFloat(room.coord.x) * scale * cameraScaleOffset) + MovableLayer.transform.position.x;
	roomObject.transform.position.y = (parseFloat(room.coord.y) * scale * cameraScaleOffset) + MovableLayer.transform.position.y;

	roomObject.transform.localScale.x = scale * baseScale;
	roomObject.transform.localScale.y = scale * baseScale;

}

