#pragma strict

var RoomSprite : GameObject;
var MovableLayer : GameObject;
var MaskLayer : GameObject;
var scale : float = 1;
var cameraScaleOffset : float = 100;
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
	roomSprite.name = roomID;
//	Debug.Log("P : " + roomSprite.transform.localPosition);
//	Debug.Log("P : " + MovableLayer.transform.position);
	roomSprite.transform.SetParent(MovableLayer.transform);
	roomSprite.transform.localPosition = MovableLayer.transform.position;

var spriteMask : SpriteMask = MaskLayer.GetComponent("SpriteMask");
spriteMask.updateSprites(roomSprite.transform);

//		spriteRenderer.transform.SetParent(spriteMask);
//spriteMask.updateSprites(spriteRenderer.transform);
	
	roomSprite.transform.position.x = (parseFloat(room.coord.x) * scale * cameraScaleOffset) + MovableLayer.transform.position.x;
	roomSprite.transform.position.y = (parseFloat(room.coord.y) * scale * cameraScaleOffset) + MovableLayer.transform.position.y;

	var baseScale = 12;
	roomSprite.transform.localScale.x = scale * baseScale;
	roomSprite.transform.localScale.y = scale * baseScale;

//	Debug.Log("UI : Adding sprite : " + roomID);
}

