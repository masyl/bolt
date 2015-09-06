#pragma strict

@System.NonSerialized
var heroes : Array = new Array();
var dungeon : Dungeon = null;
var speed = 20;

function Start () {
}

function Update ()
{
	for (var hero : Hero in heroes)
	{
		hero.Step();
	}
}

/**
* Add a new hero to the team
*/
public function Add() : Hero
{
	var hero : Hero = new Hero();	
	hero
		.Speed(speed)
		.Enter(dungeon);

	heroes.Push(hero);
}



