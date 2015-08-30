﻿#pragma strict

public class Dungeon
{
	public var rooms : Array;
	public var entrance : Room = null;

	var _onRoomCreate : Function = null;
	var _onRoomUpdate : Function = null;

		public function Dungeon ()
	{
		Debug.Log("Dungeon started");
		this.rooms = new Array();
	}

	public function onRoomCreate(f : Function) {
		_onRoomCreate = f;
	}

	public function onRoomCreate(room : Room) {
		if (_onRoomCreate != null) _onRoomCreate(room);
	}

	public function onRoomUpdate(f : Function) {
		_onRoomUpdate = f;
	}

	public function onRoomUpdate(room : Room) {
		if (_onRoomUpdate != null) _onRoomUpdate(room);
	}

	/**
	* Check if the dungeon is considered empty (has no rooms)
	*/	
	public function isEmpty () : boolean
	{
		var isEmpty : boolean;
		if (this.rooms.length > 0) isEmpty = false;
		return isEmpty;
	}	

	public function roomCount () : int
	{
		return rooms.length;
	}
	
	public function AddRoom (room : Room)
	{
		//todo: only accept room if it doesnt already exist at that coord
		if (room != null)
		{
			rooms.Add(room);
			onRoomCreate(room);
		}
	}
	
	public function getRoom (coord : Coord)
	{
		for (var room:Room in rooms)
		{
			if (room.coord.equals(coord)) return room;
		}
		return null;
	}
}

public class Room
{
	public var coord : Coord;
	
	public function Room (coord)
	{
		this.coord = new Coord(coord);
		// todo: broadcast roomCreated message
	}
	
}





