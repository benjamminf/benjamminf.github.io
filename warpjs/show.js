const element = document.getElementById('warp')
const warp = new Warp(element)

warp.interpolate(5)
warp.transform(([x, y]) => [x, y, x, y])

class EffectShow
{
	constructor(warp)
	{
		this.warp = warp
		this.effects = {}
	}

	add(name, generator)
	{
		this.effects[name] = generator
	}

	run(name, duration=-1)
	{
		return new Promise(resolve =>
		{
			this.stop().then(() =>
			{
				this.running = true

				if(duration >= 0)
				{
					setTimeout(resolve, duration)
				}

				const transformer = this.effects[name]()
				const runner = () =>
				{
					const done = transformer(this.warp, this.stopping)

					if(this.stopping && done)
					{
						this.stopping = false
						cancelAnimationFrame(this.frame)
					}
					else
					{
						this.frame = requestAnimationFrame(runner)
					}
				}

				runner()
			})
		})
	}

	stop(force=false)
	{
		if(this.running)
		{
			if(force)
			{
				this.stopping = false
				cancelAnimationFrame(this.frame)
			}
			else
			{
				this.stopping = true
			}

			this.running = false
		}

		return new Promise(resolve =>
		{
			const checker = () =>
			{
				if(!this.stopping && !this.running)
				{
					resolve()
				}
				else
				{
					requestAnimationFrame(checker)
				}
			}

			checker()
		})
	}
}

const show = new EffectShow(warp)

show.add('reset', function()
{
	const d = 0.1

	return function(warp)
	{
		warp.transform(([x, y, ox, oy]) => [x + (ox - x) * d, y + (oy - y) * d])

		return true
	}
})

show.add('wave', function()
{
	let r = 0
	const f = 50
	const v = 0.1
	let c = 0

	return function(warp, stopping)
	{
		warp.transform(([x, y, ox, oy]) => [x, oy + Math.sin(x / f + c) * r])
		c += v

		if(stopping)
		{
			r *= 0.95
			return (r < 0.2)
		}
		else
		{
			r += (10 - r) * 0.05
		}

		return true
	}
})

show.add('twirl', function()
{
	var cx = 325 / 2;
	var cy = 100 / 2;
	var cd = Math.sqrt(cx**2 + cy**2);
	let m = 0
	const v = 0.02
	let c = 0

	return function(warp, stopping)
	{
		warp.transform(function([x, y, ox, oy])
		{
			var dx = ox - cx
			var dy = oy - cy

			var d = Math.sqrt(dx**2 + dy**2);

			const s = Math.sin(c) * m

			var cos = Math.cos(d / cd * s);
			var sin = Math.sin(d / cd * s);

			var xp = dx * cos + dy * sin;
			var yp = dy * cos - dx * sin;

			return [xp + cx, yp + cy]
		})

		c += v

		if(stopping)
		{
			m *= 0.95
			return (m < 0.005)
		}
		else
		{
			m += (6 - m) * 0.05
		}

		return true
	}
})
