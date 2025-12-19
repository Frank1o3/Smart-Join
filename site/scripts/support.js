(function(){
  const form = document.getElementById('issueForm')
  if(!form) return
  form.addEventListener('submit', function(e){
    e.preventDefault()
    const type = document.getElementById('type').value
    const title = document.getElementById('title').value
    const body = document.getElementById('body').value
    const browser = document.getElementById('browser').value
    const version = document.getElementById('version').value

    let fullBody = `**Type:** ${type}\n\n${body}`
    if(browser) fullBody += `\n\n**Browser:** ${browser}`
    if(version) fullBody += `\n\n**Extension version:** ${version}`

    const repo = 'Frank1o3/Smart-Join'
    const url = `https://github.com/${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(fullBody)}`

    window.location.href = url
  })
})()
