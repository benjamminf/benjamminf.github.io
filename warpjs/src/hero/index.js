import Warp from 'warpjs/src/Warp'

const $hero = document.getElementById('hero')
const $cursor = document.getElementById('hero-cursor')
const $logo = document.getElementById('hero-logo')

const smudgeRadius = 100
const smudgeStrength = 0.33

let mouseX = 0
let mouseY = 0
let lastMouseX = 0
let lastMouseY = 0

window.addEventListener('mousemove', function(e)
{
	lastMouseX = mouseX
	lastMouseY = mouseY
	mouseX = e.clientX
	mouseY = e.clientY
})

window.addEventListener('mouseover', function(e)
{
	const hideCursor = (e.target.tagName.toLowerCase() === 'a')
	$cursor.classList.toggle('-hidden', hideCursor)
})

function positionCursor()
{
	$cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`
	$cursor.style.fontSize = `${smudgeRadius}px`

	requestAnimationFrame(positionCursor)
}

positionCursor()

function smudgeFactory(startX, startY, endX, endY, radius, strength)
{
	const deltaX = endX - startX
	const deltaY = endY - startY

	return function smudge([ x, y ])
	{
		const distX = endX - x
		const distY = endY - y
		const dist = Math.sqrt(distX**2 + distY**2)

		if(dist <= radius)
		{
			x += strength * deltaX * (radius - dist) / radius
			y += strength * deltaY * (radius - dist) / radius
		}
		
		return [ x, y ]
	}
}

const warp = new Warp($logo)
warp.interpolate(3)

window.addEventListener('mousemove', () => requestAnimationFrame(() =>
{
	const origin = $logo.getBoundingClientRect()

	warp.transform(smudgeFactory(
		lastMouseX - origin.x,
		lastMouseY - origin.y,
		mouseX - origin.x,
		mouseY - origin.y,
		smudgeRadius,
		smudgeStrength
	))
}))
