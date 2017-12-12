import Warp from 'warpjs'

const $hero = document.getElementById('hero')
const $cursor = document.getElementById('hero-cursor')
const $logo = document.getElementById('hero-logo')

const smudgeRadius = 100
const smudgeStrength = 0.33

let mouseX = 0
let mouseY = 0
let lastMouseX = null
let lastMouseY = null

window.addEventListener('mousemove', (e) => requestAnimationFrame(() =>
{
	if (lastMouseX === null || lastMouseY === null)
	{
		$cursor.classList.remove('-hidden')
	}
	
	lastMouseX = mouseX
	lastMouseY = mouseY
	mouseX = e.clientX
	mouseY = e.clientY
}))

window.addEventListener('mouseover', function(e)
{
	const hideCursor = (e.target.tagName.toLowerCase() === 'a')
	$cursor.classList.toggle('-hidden', hideCursor)
})

let touchPoints = {}

window.addEventListener('touchstart', function(e)
{
	Array.from(e.changedTouches).forEach(touch =>
	{
		touchPoints[touch.identifier] = {
			lastX: touch.clientX,
			lastY: touch.clientY,
			x: touch.clientX,
			y: touch.clientY,
		}
	})
})

window.addEventListener('touchmove', (e) => requestAnimationFrame(() =>
{
	Array.from(e.changedTouches).forEach(touch =>
	{
		const touchPoint = touchPoints[touch.identifier]
		if (touchPoint)
		{
			touchPoint.lastX = touchPoint.x
			touchPoint.lastY = touchPoint.y
			touchPoint.x = touch.clientX
			touchPoint.y = touch.clientY
		}
	})
}))

window.addEventListener('touchend', function(e)
{
	Array.from(e.changedTouches).forEach(touch =>
	{
		delete touchPoints[touch.identifier]
	})
})

window.addEventListener('touchcancel', function(e)
{
	Array.from(e.changedTouches).forEach(touch =>
	{
		delete touchPoints[touch.identifier]
	})
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
warp.interpolate(10)

let enableMouseWarp = true
window.addEventListener('mousemove', () =>
	enableMouseWarp &&
	lastMouseX !== null &&
	lastMouseY !== null &&
	requestAnimationFrame(() =>
	{
		const origin = $logo.getBoundingClientRect()

		warp.transform(smudgeFactory(
			lastMouseX - origin.left,
			lastMouseY - origin.top,
			mouseX - origin.left,
			mouseY - origin.top,
			smudgeRadius,
			smudgeStrength
		))
	})
)

window.addEventListener('touchstart', () => enableMouseWarp = false)
window.addEventListener('touchend', () => enableMouseWarp = true)
window.addEventListener('touchcancel', () => enableMouseWarp = true)

window.addEventListener('touchmove', () => requestAnimationFrame(() =>
{
	const origin = $logo.getBoundingClientRect()

	Object.values(touchPoints).forEach(({ lastX, lastY, x, y }) =>
	{
		warp.transform(smudgeFactory(
			lastX - origin.left,
			lastY - origin.top,
			x - origin.left,
			y - origin.top,
			smudgeRadius,
			smudgeStrength
		))
	})
}))
