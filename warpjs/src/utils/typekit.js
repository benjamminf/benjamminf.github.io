export function loadTypekit(id, timeout=3000)
{
	const docEl = document.documentElement
	const scriptEl = document.createElement('script')

	docEl.classList.add('wf-loading')

	const inactivateTimeout = setTimeout(function()
	{
		docEl.classList.remove('wf-loading')
		docEl.classList.add('wf-inactive')
	}, timeout)

	let loadedFlag = false
	scriptEl.src = `https://use.typekit.net/${id}.js`
	scriptEl.async = true
	scriptEl.onload = scriptEl.onreadystatechange = function()
	{
		const loadedState = this.readyState || 'complete'

		if (!loadedFlag && (loadedState === 'complete' || loadedState === 'loaded'))
		{
			loadedFlag = true
			clearTimeout(inactivateTimeout)
			try
			{
				Typekit.load({
					kitId: id,
					scriptTimeout: timeout,
					async: true,
				})
			}
			catch(e) {}
		}
	}
	
	document.head.append(scriptEl)
}
