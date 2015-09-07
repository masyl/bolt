#pragma strict

/**
 * Agent that will roam the dungeon and be the player avatar
 */

@System.NonSerialized
public var room : Room = null;

public var dungeon : Dungeon = null;
public var speed : float = 0;
var lastStepTime : long = 0;
public var isPlaying : boolean = true;

public var direction : Direction = new Direction();
public var _camera : GameObject = null;
public var x : float = 0;
public var y : float = 0;

function Start ()
{
	this._camera = GameObject.Find("MainCamera");
	Debug.Log("Hero: Hi there, I'm the hero!");
}

function Update ()
{
}

function AnimateToPosition() {
	var scale = 1583.2;
	var offsetX : float = -300 - scale;
	var offsetY : float = 300;
	if (room != null)
	{
		x = room.coord.x * scale + offsetX;
		y = room.coord.y * scale + offsetY;
		var newPosition = new Vector3 (x, y, 0);

		iTween.MoveTo(gameObject, iTween.Hash(
			"position", newPosition,
			"time", 0.7f,
			"onupdate","onPositionUpdate",
			"onupdatetarget",gameObject,
			"easetype",iTween.EaseType.easeInOutQuad
		));
	}	
}

public function onPositionUpdate()
{
//	if (this._camera !=null)
//	{
		this._camera.transform.position.x = transform.position.x;
		this._camera.transform.position.y = transform.position.y;
//	}
}

				
				

public function Step ()
{
	if (!this.isPlaying) return this;
	
	// Control the speed at which the Hero can move
	if (System.DateTime.Now.Ticks > lastStepTime + speed)
	{
		NextActionItem();
		lastStepTime = System.DateTime.Now.Ticks;
	}
	return this;
}

public function Speed (milliseconds : float)
{
	this.speed = milliseconds * 1000;
	return this;
}

public function NextActionItem ()
{
	var door : Door = null;
	direction.RandomTurn(2);
	if (room != null) {
		door = room.findDoorInDirection(direction);
		if (door) goTroughDoor(door);
	}
	//todo: Move thoward next room if possible
	return this;
}

public function goTroughDoor(door: Door)
{
	room = door.destination;
	AnimateToPosition();
}

public function Enter (dungeon : Dungeon)
{
	this.dungeon = dungeon;
	if (dungeon != null) {			
		if (this.dungeon.entrance == null)
		{
			Debug.Log("Hero: Can't find dungeon entrance!");
		} else {
			room = this.dungeon.entrance;
			AnimateToPosition();
			Debug.Log("Hero: Entered dungeon at " + this.room.coord.address());
		}
	}
	else
	{
		Debug.Log("Hero: Sorry... no dungeon!");
	}
	return this;
}



