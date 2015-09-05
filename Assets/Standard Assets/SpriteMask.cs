//----------------------------------------------
//                 SpriteMask
//          Copyright © 2015 TrueSoft
//             support@truesoft.pl
//----------------------------------------------

//#define SPRITE_MASK_DEBUG

#if UNITY_4_3 || UNITY_4_4 || UNITY_4_5
#define BEFORE_4_6
#endif
using UnityEngine;
using UnityEngine.Rendering;
using System.Collections.Generic;

[ExecuteInEditMode]
public class SpriteMask : MonoBehaviour
{
	private const string SHADER_SPRITE_DEFAULT = "SpriteMask/Default";
	private const string SHADER_MASK_ROOT = "SpriteMask/Mask";
	private const string STR_STENCIL = "_Stencil";
	private const string STR_STENCIL_COMPARISON = "_StencilComp";
	private const string STR_STENCIL_READ_MASK = "_StencilReadMask";

	/// <summary>
	/// Max supported mask levels. Allowed values: 1 - 7
	/// Default value is 3.
	/// </summary>
	private const int MAX_LEVELS = 3;

	/// <summary>
	/// Base render queue used by this mask renderer. 
	/// </summary>
	private const int BASE_RENDER_QUEUE = 3000;
	
	//-----------------------------------------------------------

	[SerializeField]
	private Type
		_type = Type.Rectangle;
	[SerializeField]
	private Vector2
		_size = new Vector2 (100f, 100f);
	[SerializeField]
	private Vector2
		_pivot = new Vector2 (0.5f, 0.5f);
	[SerializeField]
	private Texture2D
		_texture;
	[SerializeField]
	private Sprite
		_sprite;

	//-----------------------------------------------------------

	private static bool[] stencilIds = new bool [256];
	private int propertyStencilReadMask = -1;
	private int propertyStencilComp = -1;
	private int propertyStencil = -1;
	
	//-----------------------------------------------------------

#if !BEFORE_4_6
	private static List<Renderer> rendererComponents = new List<Renderer> ();
	private static List<SpriteMask> maskComponents = new List<SpriteMask> ();
#endif
	private Vector3[] vertices = new Vector3[4];
	private Material _defaultSpriteMaterial;
	private SpriteRenderer spriteRenderer;
	private MeshRenderer meshRenderer;
	private bool isTypeApplyed = false;
	private Material _maskMaterial;
	private MeshFilter meshFilter;
	private int? parentStencilId;
	private string instanceId;
	private int _stencilId;
	private int _level = 0;

	//-----------------------------------------------------------

	/// <summary>
	/// Stencil ID value for this mask.
	/// </summary>
	public int stencilId {
		get {
			return _stencilId;
		}
	}
	
	/// <summary>
	/// Mask ID per level.
	/// </summary>
	public int maskIdPerLevel {
		get {
			return _stencilId & (255 >> MAX_LEVELS);
		}
	}

	/// <summary>
	/// Current masking level for this mask.
	/// </summary>
	public int level {
		get {
			return _level;
		}
	}

	/// <summary>
	/// Current used render queue value for this mask.
	/// </summary>
	public int maskRenderQueue {
		get {
			return BASE_RENDER_QUEUE + (2 * _level);
		}
	}

	/// <summary>
	/// Current used render queue value for sprite childs.
	/// All sprites must be renderer after mask render.
	/// </summary>
	public int spriteRenderQueue {
		get {
			return maskRenderQueue + 1;
		}
	}
	
	/// <summary>
	/// Is this mask at level 0?
	/// </summary>
	public bool isRoot {
		get {
			return _level == 0;
		}
	}

	/// <summary>
	/// Is this mask a child of another mask?
	/// </summary>
	public bool isChild {
		get {
			return _level > 0;
		}
	}

	/// <summary>
	/// Current used masking pattern type.
	/// </summary>
	public Type type {
		get {
			return _type;
		}
		set {
			if (_type != value || !isTypeApplyed) {
				_type = value;

#if UNITY_EDITOR
				if (Application.isPlaying)
#endif
				applyType ();
			}
		}
	}

	/// <summary>
	/// Mask size. 
	/// Supported only on types: Rectangle, Texture.
	/// </summary>
	public Vector2 size {
		get {
			switch (_type) {
			case Type.Texture:
			case Type.Rectangle:
				return _size;
			case Type.Sprite:
				if (spriteRenderer != null && spriteRenderer.sprite != null) {
					return spriteRenderer.sprite.bounds.size;
				}
				break;
			}
			
			return Vector2.zero;
		}
		set {
			if (!isTypeApplyed) {
				applyType ();
			}

			_size = value;

			if (_type == Type.Rectangle || _type == Type.Texture) {
				udpateMeshSize ();
			} else {
				Debug.LogWarning (string.Concat ("Size change not supported on mask type: ", _type));
			}
		}
	}

	/// <summary>
	/// Mask pivot. 
	/// Supported only on types: Rectangle, Texture.
	/// </summary>
	public Vector2 pivot {
		get {
			switch (_type) {
			case Type.Texture:
			case Type.Rectangle:
				return _pivot;
			case Type.Sprite:
				if (spriteRenderer != null && spriteRenderer.sprite != null) {
					Bounds b = spriteRenderer.sprite.bounds;
					Vector2 m = b.min;
					Vector2 s = b.size;
					return new Vector2 (-m.x / s.x, -m.y / s.y);
				}
				break;
			}
			
			return Vector2.zero;
		}
		set {
			if (!isTypeApplyed) {
				applyType ();
			}

			_pivot = value;

			if (_type == Type.Rectangle || _type == Type.Texture) {
				udpateMeshSize ();
			} else {
				Debug.LogWarning (string.Concat ("Pivot change not supported on mask type: ", _type));
			}
		}
	}

	/// <summary>
	/// Sprite used for masking. 
	/// Supported only on type: Sprite.
	/// </summary>
	public Sprite sprite {
		get {
			return _sprite;
		}
		set {
			if (!isTypeApplyed) {
				applyType ();
			}

			if (_type == Type.Sprite) {
				spriteRenderer.sprite = _sprite = value;
			} else {
				Debug.LogWarning (string.Concat ("Sprite change not supported on mask type: ", _type));
			}
		}
	}

	/// <summary>
	/// Texture used for masking. 
	/// Supported only on type: Texture.
	/// </summary>
	public Texture2D texture {
		get {
			return _texture;
		}
		set {
			if (!isTypeApplyed) {
				applyType ();
			}

			if (_type == Type.Texture) {
				maskMaterial.mainTexture = _texture = value;
			} else {
				Debug.LogWarning (string.Concat ("Texture change not supported on mask type: ", _type));
			}
		}
	}

	/// <summary>
	/// Default material used for all childs of type Sprite.
	/// </summary>
	private Material defaultSpriteMaterial {
		get {
			if (_defaultSpriteMaterial == null) {
				Shader shader = Shader.Find (SHADER_SPRITE_DEFAULT);
				_defaultSpriteMaterial = new Material (shader);
				_defaultSpriteMaterial.hideFlags = HideFlags.HideAndDontSave;
				_defaultSpriteMaterial.name = string.Concat (shader.name, " OWNER_ID:", instanceId);
			}
			return _defaultSpriteMaterial;
		}
	}

	/// <summary>
	/// Material used by this mask.
	/// </summary>
	private Material maskMaterial {
		get {
			if (_maskMaterial == null) {
				Shader shader = Shader.Find (SHADER_MASK_ROOT);
				_maskMaterial = new Material (shader);
				_maskMaterial.hideFlags = HideFlags.HideAndDontSave;
				_maskMaterial.name = string.Concat (shader.name, " OWNER_ID:", instanceId);
			}
			return _maskMaterial;
		}
	}

	//-----------------------------------------------------------

	void Awake ()
	{
		instanceId = GetInstanceID ().ToString ();

		propertyStencil = Shader.PropertyToID (STR_STENCIL);
		propertyStencilComp = Shader.PropertyToID (STR_STENCIL_COMPARISON);
		propertyStencilReadMask = Shader.PropertyToID (STR_STENCIL_READ_MASK);

		clearChildsMaterial (transform);

		spriteRenderer = GetComponent <SpriteRenderer> ();
		meshRenderer = GetComponent <MeshRenderer> ();
		meshFilter = GetComponent <MeshFilter> ();
		if (meshFilter != null && meshFilter.sharedMesh != null) {
			meshFilter.sharedMesh = null;
		}
	}
	
	void OnEnable ()
	{
#if SPRITE_MASK_DEBUG
		log ("OnEnable >>>");
#endif

		parentStencilId = null;

		Renderer r = getRenderer (this);
		if (r != null) {
			r.enabled = true;
		}

		if (isTypeApplyed) {
			update ();
		}

#if SPRITE_MASK_DEBUG
		log ("OnEnable <<<");
#endif
	}

	void Start ()
	{
#if SPRITE_MASK_DEBUG
		log ("Start >>>");
#endif

		if (!isTypeApplyed) {
			applyType ();
		}

		update ();

#if SPRITE_MASK_DEBUG
	log ("Start <<<");
#endif
	}

#if UNITY_EDITOR
	void Update ()
	{
		if (!Application.isPlaying) {
			if (!isTypeApplyed) {
				applyType ();
			}

			update ();
		}
	}

	void RequestTypeApply () {
		isTypeApplyed = false;
	}
#endif

	void OnDisable ()
	{
#if SPRITE_MASK_DEBUG
		log ("OnDisable >>>");
#endif

		// Clear stencil ID
		if (_stencilId > 0) {
			releaseId (_stencilId);
			_stencilId = 0;
		}

		if (gameObject.activeInHierarchy) {
			// Just disabled

			Renderer r = getRenderer (this);
			if (r != null) {
				// Turn off renderer
				r.enabled = false;
			}

			// If there is enabled parent mask, then all childs sprites should use its stencil ID
			SpriteMask parentMask = getParentMask (transform);
			if (parentMask != null) {
				parentStencilId = parentMask.stencilId;
			} else {
				parentStencilId = null;
			}

			updateSprites ();
		}

#if SPRITE_MASK_DEBUG
		log ("OnDisable <<<");
#endif
	}

	//-----------------------------------------------------------

	/// <summary>
	/// Call this function after you change mask hierarchy at runtime.
	/// </summary>
	[ContextMenu ("Update Mask")]
	public void updateMask ()
	{
#if SPRITE_MASK_DEBUG
		log ("updateMask >>>");
#endif

		if (!isTypeApplyed) {
			return;
		}

		if (_stencilId > 0) {
			releaseId (_stencilId);
			_stencilId = 0;
		}
		_level = 0;

		// Get mask level
		Transform t = transform.parent;
		while (t != null) {
			SpriteMask mask = getSpriteMask (t);
			if (mask != null && mask.enabled) {
				_level++;
			}
			t = t.parent;
		}

		int maxLevel = MAX_LEVELS - 1;
		if (_level > maxLevel) {
			Debug.LogError ("Maximum number of mask levels has been exceeded: max=" + maxLevel + " current=" + _level);
			_level = maxLevel;
		}

		_stencilId = getId (_level);

#if SPRITE_MASK_DEBUG
		log ("updateMask stencil=" + _stencilId + " _level=" + _level);
#endif

		if (_stencilId == -1) {
			Debug.LogError ("Maximum number of mask per levels has been exceeded: " + (255 >> MAX_LEVELS));
			_stencilId = 0;
		}

		Material m = GetComponent<Renderer>().sharedMaterial;

		int readMask;
		CompareFunction comp;
		if (isRoot) {
			readMask = 255;
			comp = CompareFunction.Always;
		} else {
			readMask = 255 >> (_level - 1);
			comp = CompareFunction.Less;
		}

		m.renderQueue = maskRenderQueue;
		updateMaterial (m, _stencilId, comp, readMask);

#if SPRITE_MASK_DEBUG
		log ("updateMask <<<");
#endif
	}

	/// <summary>
	/// Call this function after you change/attach child sprites at runtime.
	/// 
	/// NOTE: Calling this method at runtime can be 'expensive', because it runs update an all child object of this mask. 
	/// If you want to update a specific sprite, please use method 'updateSprites (Transform trans)',
	/// with updates that specific sprite and its childs sprites.
	/// </summary>
	[ContextMenu ("Update Sprites")]
	public void updateSprites ()
	{
		updateSprites (transform);
	}

	/// <summary>
	/// Updates sprite that is on the 'trans' and all sprites that are "under" (are child of) the 'trans' object.
	/// </summary>
	public void updateSprites (Transform trans)
	{
#if SPRITE_MASK_DEBUG
		log ("updateSprites >>>");
#endif

		if (!isTypeApplyed) {
			return;
		}

		int stencil;
		CompareFunction comp;
		if (parentStencilId.HasValue) {
			stencil = parentStencilId.Value;
			comp = CompareFunction.Equal;
		} else {
			stencil = _stencilId;
			comp = enabled ? CompareFunction.Equal : CompareFunction.Always;
		}

		doUpdateSprite (trans, comp, stencil);

#if SPRITE_MASK_DEBUG
		log ("updateSprites <<<");
#endif
	}

	/// <summary>
	/// Call this function after you change mask hierarchy or attach child sprites at runtime.
	/// </summary>
	public void update ()
	{
		updateMask ();
		updateSprites ();
	}

	/// <summary>
	/// Find mask component for <code>t</code> and call <code>updateSprites(t)</code>.
	/// </summary>
	public static SpriteMask updateFor (Transform t)
	{
		SpriteMask mask = getParentMask (t);
		if (mask != null) {
			mask.updateSprites (t);
		}

		return mask;
	}

	/// <summary>
	/// Find mask component for <code>t</code>.
	/// </summary>
	public static SpriteMask getParentMask (Transform t)
	{
		t = t.parent;
		while (t != null) {
			SpriteMask mask = getSpriteMask (t);
			if (mask != null && mask.enabled) {
				return mask;
			}
			t = t.parent;
		}
		
		return null;
	}

	//-----------------------------------------------------------

	private void applyType ()
	{
#if SPRITE_MASK_DEBUG
		log ("applyType >>>");
#endif

		switch (_type) {
		case Type.Rectangle:
			_texture = null;
			_sprite = null;
			maskMaterial.mainTexture = null;
			destroySpriteComponents ();
			
			ensureMeshComponents ();
			udpateMeshSize ();
			break;
		case Type.Sprite:
			_texture = null;
			maskMaterial.mainTexture = null;
			destroyMeshComponents ();
			
			ensureSpriteRenderer ();
			spriteRenderer.sprite = _sprite;
			break;
		case Type.Texture:
			_sprite = null;
			destroySpriteComponents ();
			
			ensureMeshComponents ();
			udpateMeshSize ();
			maskMaterial.mainTexture = _texture;
			break;
		}
		
		isTypeApplyed = true;

#if SPRITE_MASK_DEBUG
		log ("applyType <<<");
#endif
	}

	private void doUpdateSprite (Transform t, CompareFunction comp, int stencil)
	{
#if SPRITE_MASK_DEBUG
		log ("doUpdateSprite >>> t=" + t.name + " comp=" + comp + " stencil=" + stencil + " t.childsCount=" + t.childCount);
#endif
		SpriteMask mask = getSpriteMask (t);
		if (mask != null) {
			if (mask != this && mask.enabled) {
#if UNITY_EDITOR
					if (Application.isPlaying) // Don't update in edit mode. Update() will be called on child masks.
#endif
				mask.update ();
				return;
			}
		} else {
			Renderer r = getRenderer (t);
#if SPRITE_MASK_DEBUG
			log ("doUpdateSprite: renderer=" + r);
#endif
			if (r != null) {
				Material m = r.sharedMaterial;
#if SPRITE_MASK_DEBUG
				log ("doUpdateSprite: material=" + m);
#endif

				if (m == null || !m.HasProperty (propertyStencil)) {
					m = defaultSpriteMaterial;
					r.sharedMaterial = m;
				}
				m.renderQueue = spriteRenderQueue;
				updateMaterial (m, stencil, comp, null);
			}
		}

		int childsCount = t.childCount;
		if (childsCount > 0) {
			for (int i=0; i<childsCount; i++) {
				doUpdateSprite (t.GetChild (i), comp, stencil);
			}
		}

#if SPRITE_MASK_DEBUG
		log ("doUpdateSprite <<<");
#endif
	}

	private void clearChildsMaterial (Transform t)
	{
		int childsCount = t.childCount;
		if (childsCount == 0) {
			return;
		}

		for (int i=0; i<childsCount; i++) {
			Transform child = t.GetChild (i);

			SpriteMask mask = getSpriteMask (child);
			if (mask != null) {
				continue;
			}

			Renderer r = getRenderer (child);
			if (r != null) {
				Material m = r.sharedMaterial;
				if (m != null) {
					string ownerId = readOwnerId (m.name);
					if (ownerId != null && !ownerId.Equals (instanceId)) {
						// This material does not belong to this mask
						r.sharedMaterial = null;
					}
				}
			}
			
			clearChildsMaterial (child);
		}
	}

	private void updateMaterial (Material m, int? stencil, CompareFunction? comp, int? readMask)
	{
		if (stencil.HasValue) {
			m.SetInt (propertyStencil, stencil.Value);
		}
		
		if (comp.HasValue) {
			m.SetInt (propertyStencilComp, (int)comp.Value);
		}
		
		if (readMask.HasValue) {
			m.SetInt (propertyStencilReadMask, readMask.Value);
		}
	}

	private int getId (int level)
	{
		int v = 128 >> level;
		int maxIdsPerLevel = 255 >> MAX_LEVELS;

		for (int i=0; i<maxIdsPerLevel; i++) {
			int id = v + i;

			if (!stencilIds [id]) {
				stencilIds [id] = true;
				return id;
			}
		}

		return -1;
	}

	private void releaseId (int id)
	{
		stencilIds [id] = false;
	}

	private string readOwnerId (string str)
	{
		int idx = str.IndexOf ("OWNER_ID");
		if (idx != -1) {
			return str.Substring (idx + 9);
		} else {
			return null;
		}
	}

	private void destroySpriteComponents ()
	{
		if (spriteRenderer != null) {
#if UNITY_EDITOR
			if (!Application.isPlaying)
				DestroyImmediate (spriteRenderer);
			else
#endif
			Destroy (spriteRenderer);
			spriteRenderer = null;
		}
	}

	private void destroyMeshComponents ()
	{
		if (meshFilter != null) {
#if UNITY_EDITOR
			if (!Application.isPlaying)
				DestroyImmediate (meshFilter);
			else
#endif
			Destroy (meshFilter);
			meshFilter = null;
		}

		if (meshRenderer != null) {
#if UNITY_EDITOR
			if (!Application.isPlaying)
				DestroyImmediate (meshRenderer);
			else
#endif
			Destroy (meshRenderer);
			meshRenderer = null;
		}
	}

	private void ensureSpriteRenderer ()
	{
		if (spriteRenderer == null) {
			spriteRenderer = GetComponent <SpriteRenderer> ();

			if (spriteRenderer == null) {
				spriteRenderer = gameObject.AddComponent <SpriteRenderer> ();
			}
		}
		spriteRenderer.sharedMaterial = maskMaterial;
	}

	private void ensureMeshComponents ()
	{
		if (meshFilter == null) {
			meshFilter = GetComponent <MeshFilter> ();

			if (meshFilter == null) {
				meshFilter = gameObject.AddComponent <MeshFilter> ();
			}
		}

		if (meshFilter.sharedMesh == null) {
			Mesh mesh = new Mesh ();
			mesh.hideFlags = HideFlags.HideAndDontSave;
			mesh.name = string.Concat ("RectMesh OWNER_ID:", instanceId);
			mesh.MarkDynamic ();

			meshFilter.sharedMesh = mesh;

			mesh.vertices = vertices;

			Vector2[] uv = new Vector2[4];
			uv [0] = new Vector2 (0, 1);
			uv [1] = new Vector2 (1, 1);
			uv [2] = new Vector2 (1, 0);
			uv [3] = new Vector2 (0, 0);
			mesh.uv = uv;
			
			int[] triangles = new int[6];
			triangles [0] = 0;
			triangles [1] = 1;
			triangles [2] = 2;
			triangles [3] = 2;
			triangles [4] = 3;
			triangles [5] = 0;
			mesh.triangles = triangles;
			
			mesh.RecalculateNormals ();
		}

		if (meshRenderer == null) {
			meshRenderer = GetComponent <MeshRenderer> ();
			
			if (meshRenderer == null) {
				meshRenderer = gameObject.AddComponent <MeshRenderer> ();
			}
		}
		meshRenderer.sharedMaterial = maskMaterial;
	}

	private void udpateMeshSize ()
	{
		if (meshFilter != null) {
			float xMin = -_pivot.x * _size.x;
			float yMin = -_pivot.y * _size.y;
			float xMax = xMin + _size.x;
			float yMax = yMin + _size.y;
		
			vertices [0] = new Vector3 (xMin, yMax, 0);
			vertices [1] = new Vector3 (xMax, yMax, 0);
			vertices [2] = new Vector3 (xMax, yMin, 0);
			vertices [3] = new Vector3 (xMin, yMin, 0);
			meshFilter.sharedMesh.vertices = vertices;
		
			meshFilter.sharedMesh.RecalculateBounds ();
		}
	}

	private static Renderer getRenderer (Component t)
	{
#if BEFORE_4_6
		return t.GetComponent <Renderer> ();
#else
		t.GetComponents <Renderer> (rendererComponents);
		Renderer r = rendererComponents.Count > 0 ? rendererComponents [0] : null;
		rendererComponents.Clear ();
		return r;
#endif
	}

	private static SpriteMask getSpriteMask (Component t)
	{
#if BEFORE_4_6
		return t.GetComponent <SpriteMask> ();
#else
		t.GetComponents <SpriteMask> (maskComponents);
		SpriteMask sm = maskComponents.Count == 1 ? maskComponents [0] : null;
		maskComponents.Clear ();
		return sm;
#endif
	}

#if UNITY_EDITOR
	void OnDrawGizmos ()
	{
		Gizmos.color = enabled ? Color.red : Color.grey;
		Gizmos.matrix = Matrix4x4.TRS (transform.position, transform.rotation, transform.lossyScale);

		Vector2 s = size;
		Vector2 p = pivot;
		Vector2 c = new Vector2 ((-p.x * s.x) + (s.x / 2f), (-p.y * s.y) + (s.y / 2f));

		Gizmos.DrawWireCube (c, s);
	}

	[ContextMenu ("Print used Stencil ID's")]
	private void printUsedStencilIds () 
	{
		string ids = "";
		for (int i=0;i<stencilIds.Length;i++) {
			if (stencilIds [i]) {
				ids = string.Concat (ids, " ", i.ToString ());
			}
		}
		print ("Used Stencil IDs:" + ids);
	}
#endif

#if SPRITE_MASK_DEBUG
	private void log (string msg)
	{
		print ("[" + name + "] @" + Time.frameCount + ": " + msg);
	}
#endif

	public enum Type
	{
		Rectangle,
		Sprite,
		Texture
	}
}
