#pragma strict

var RoomSprite : GameObject;

function Start () {
	Debug.Log("Minimap started!");

}

function Update () {

}


public function onRoomUpdated(room : Room)
{
	var roomID = "room:" + room.coord.address();
	Debug.Log("Room updated : " + room.coord.address());
	var sprite : GameObject = GameObject.Find(roomID);
	var signature : String = room.getDoorsSignature();
	var newSprite : String;
	var num : int;
	num = 17;
	switch (signature)
	{
		case "0000":
			num = 9;
			break;
		case "1000":
			num = 8;
			break;
		case "0100":
			num = 13;
			break;
		case "0010":
			num = 3;
			break;
		case "0001":
			num = 15;
			break;
		case "1010":
			num = 6;
			break;
		case "0101":
			num = 1;
			break;
		case "1100":
			num = 12;
			break;
		case "0110":
			num = 0;
			break;
		case "0011":
			num = 2;
			break;
		case "1001":
			num = 14;
			break;
		case "0111":
			num = 4;
			break;
		case "1011":
			num = 11;
			break;
		case "1101":
			num = 16;
			break;
		case "1110":
			num = 10;
			break;
		case "1111":
			num = 7;
			break;
	}
	var spriteRenderer : SpriteRenderer = sprite.GetComponent("SpriteRenderer");
	var res : Array = Resources.LoadAll("Sprites/minimap", Sprite);
	spriteRenderer.sprite = res[num];
}

public function onRoomCreated(room : Room)
{
	var roomID = "room:" + room.coord.address();
	var roomSprite : GameObject = Instantiate(RoomSprite);
	var signature = room.getDoorsSignature();
	roomSprite.name = roomID;
	var scale : float = 68;
	roomSprite.transform.position.x = parseFloat(room.coord.x) * scale;
	roomSprite.transform.position.y = parseFloat(room.coord.y) * scale;
	var MinimapRooms : GameObject = GameObject.Find("Canvas");
	roomSprite.transform.SetParent(MinimapRooms.transform);
//	Debug.Log("UI : Adding sprite : " + roomID);
}

