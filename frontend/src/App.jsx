import { useEffect, useState } from 'react'

function App() {
  const [users, setUsers] = useState([])
  const [pingStatus, setPingStatus] = useState('Checking API...')

  useEffect(() => {
   
    fetch('/api/ping')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setPingStatus(data.ok ? `API OK (${data.time})` : 'API responded but not OK'))
      .catch(err => setPingStatus(`API error: ${err.message}`))

    
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
  }, [])

  return (
    <div>
      <h1>Frontend ↔ Backend test</h1>
      <p>{pingStatus}</p>
      <h2>Users</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.name}</li>)}
      </ul>
    </div>
  )
}

export default App