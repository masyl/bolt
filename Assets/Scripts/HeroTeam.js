#pragma strict

@System.NonSerialized
var heroes : Array = new Array();
var dungeon : Dungeon = null;
var speed = 20;
var HeroPrefab : GameObject = null;

function Start () {
}

function Update ()
{
	for (var hero : GameObject in heroes)
	{
		var heroScript : Hero = hero.transform.GetComponent(Hero);
		heroScript.Step();
	}
}

/**
* Add a new hero to the team
*/
public function Add() : Hero
{
	var hero : GameObject = Instantiate(HeroPrefab);

	var heroScript : Hero = hero.transform.GetComponent(Hero);

	heroScript.Speed(speed);
	heroScript.Enter(dungeon);

	hero.transform.SetParent(gameObject.transform);
	heroes.Push(hero);
}



