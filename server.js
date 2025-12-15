const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// 创建或连接到 SQLite 数据库
const db = new sqlite3.Database('./hr_system.db');

// 中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化数据库表
db.serialize(() => {
  // 部门表
  db.run(`CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 岗位表
  db.run(`CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    department_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments (id)
  )`);

  // 员工表
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,  -- 员工编号
    name TEXT NOT NULL,
    gender TEXT,
    birth_date DATE,
    phone TEXT,
    email TEXT,
    address TEXT,
    department_id INTEGER,
    position_id INTEGER,
    hire_date DATE,
    status TEXT DEFAULT 'active', -- active, probation, transferred, resigned
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments (id),
    FOREIGN KEY (position_id) REFERENCES positions (id)
  )`);

  // 试用期表
  db.run(`CREATE TABLE IF NOT EXISTS probation_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'ongoing', -- ongoing, completed, terminated
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id)
  )`);

  // 岗位调动表
  db.run(`CREATE TABLE IF NOT EXISTS position_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    from_department_id INTEGER,
    from_position_id INTEGER,
    to_department_id INTEGER,
    to_position_id INTEGER,
    transfer_date DATE NOT NULL,
    reason TEXT,
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id),
    FOREIGN KEY (from_department_id) REFERENCES departments (id),
    FOREIGN KEY (from_position_id) REFERENCES positions (id),
    FOREIGN KEY (to_department_id) REFERENCES departments (id),
    FOREIGN KEY (to_position_id) REFERENCES positions (id)
  )`);

  // 离职记录表
  db.run(`CREATE TABLE IF NOT EXISTS resignations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    resignation_date DATE NOT NULL,
    reason TEXT,
    notes TEXT,
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees (id)
  )`);
});

// API 路由

// 部门管理
// 获取所有部门
app.get('/api/departments', (req, res) => {
  db.all('SELECT * FROM departments ORDER BY id DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加部门
app.post('/api/departments', (req, res) => {
  const { name, description } = req.body;
  const stmt = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
  stmt.run([name, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, description });
  });
  stmt.finalize();
});

// 更新部门
app.put('/api/departments/:id', (req, res) => {
  const { name, description } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE departments SET name = ?, description = ? WHERE id = ?');
  stmt.run([name, description, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
  stmt.finalize();
});

// 删除部门
app.delete('/api/departments/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM departments WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
  stmt.finalize();
});

// 岗位管理
// 获取所有岗位
app.get('/api/positions', (req, res) => {
  const sql = `
    SELECT p.*, d.name as department_name 
    FROM positions p 
    LEFT JOIN departments d ON p.department_id = d.id 
    ORDER BY p.id DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加岗位
app.post('/api/positions', (req, res) => {
  const { name, description, department_id } = req.body;
  const stmt = db.prepare('INSERT INTO positions (name, description, department_id) VALUES (?, ?, ?)');
  stmt.run([name, description, department_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, description, department_id });
  });
  stmt.finalize();
});

// 更新岗位
app.put('/api/positions/:id', (req, res) => {
  const { name, description, department_id } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE positions SET name = ?, description = ?, department_id = ? WHERE id = ?');
  stmt.run([name, description, department_id, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
  stmt.finalize();
});

// 删除岗位
app.delete('/api/positions/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM positions WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
  stmt.finalize();
});

// 员工管理
// 获取所有员工
app.get('/api/employees', (req, res) => {
  const sql = `
    SELECT e.*, d.name as department_name, p.name as position_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    ORDER BY e.id DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加员工
app.post('/api/employees', (req, res) => {
  const { employee_id, name, gender, birth_date, phone, email, address, department_id, position_id, hire_date } = req.body;
  const stmt = db.prepare(`
    INSERT INTO employees 
    (employee_id, name, gender, birth_date, phone, email, address, department_id, position_id, hire_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([
    employee_id, name, gender, birth_date, phone, email, address, department_id, position_id, hire_date
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, employee_id, name });
  });
  stmt.finalize();
});

// 更新员工
app.put('/api/employees/:id', (req, res) => {
  const { employee_id, name, gender, birth_date, phone, email, address, department_id, position_id, hire_date } = req.body;
  const id = req.params.id;
  const stmt = db.prepare(`
    UPDATE employees SET 
    employee_id = ?, name = ?, gender = ?, birth_date = ?, phone = ?, email = ?, address = ?, 
    department_id = ?, position_id = ?, hire_date = ? 
    WHERE id = ?
  `);
  stmt.run([
    employee_id, name, gender, birth_date, phone, email, address, department_id, position_id, hire_date, id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
  stmt.finalize();
});

// 删除员工
app.delete('/api/employees/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
  stmt.finalize();
});

// 试用期管理
// 获取所有试用期记录
app.get('/api/probation-periods', (req, res) => {
  const sql = `
    SELECT pp.*, e.name as employee_name, e.employee_id
    FROM probation_periods pp
    JOIN employees e ON pp.employee_id = e.id
    ORDER BY pp.id DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加试用期记录
app.post('/api/probation-periods', (req, res) => {
  const { employee_id, start_date, end_date, notes } = req.body;
  const stmt = db.prepare('INSERT INTO probation_periods (employee_id, start_date, end_date, notes) VALUES (?, ?, ?, ?)');
  stmt.run([employee_id, start_date, end_date, notes], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, employee_id, start_date, end_date });
  });
  stmt.finalize();
});

// 更新试用期记录
app.put('/api/probation-periods/:id', (req, res) => {
  const { employee_id, start_date, end_date, status, notes } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE probation_periods SET employee_id = ?, start_date = ?, end_date = ?, status = ?, notes = ? WHERE id = ?');
  stmt.run([employee_id, start_date, end_date, status, notes, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ updated: this.changes });
  });
  stmt.finalize();
});

// 删除试用期记录
app.delete('/api/probation-periods/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM probation_periods WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
  stmt.finalize();
});

// 岗位调动管理
// 获取所有岗位调动记录
app.get('/api/position-transfers', (req, res) => {
  const sql = `
    SELECT pt.*, 
           e.name as employee_name,
           e.employee_id,
           from_d.name as from_department_name,
           from_p.name as from_position_name,
           to_d.name as to_department_name,
           to_p.name as to_position_name
    FROM position_transfers pt
    JOIN employees e ON pt.employee_id = e.id
    LEFT JOIN departments from_d ON pt.from_department_id = from_d.id
    LEFT JOIN positions from_p ON pt.from_position_id = from_p.id
    LEFT JOIN departments to_d ON pt.to_department_id = to_d.id
    LEFT JOIN positions to_p ON pt.to_position_id = to_p.id
    ORDER BY pt.id DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加岗位调动记录
app.post('/api/position-transfers', (req, res) => {
  const { employee_id, from_department_id, from_position_id, to_department_id, to_position_id, transfer_date, reason, approved_by } = req.body;
  
  // 开始事务处理
  db.serialize(() => {
    // 插入调动记录
    const stmt = db.prepare(`
      INSERT INTO position_transfers 
      (employee_id, from_department_id, from_position_id, to_department_id, to_position_id, transfer_date, reason, approved_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run([
      employee_id, from_department_id, from_position_id, to_department_id, to_position_id, transfer_date, reason, approved_by
    ], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // 更新员工表中的部门和岗位信息
      const updateStmt = db.prepare('UPDATE employees SET department_id = ?, position_id = ? WHERE id = ?');
      updateStmt.run([to_department_id, to_position_id, employee_id], function(updateErr) {
        if (updateErr) {
          res.status(500).json({ error: updateErr.message });
          return;
        }
        
        res.json({ 
          id: this.lastID, 
          employee_id, 
          from_department_id, 
          from_position_id, 
          to_department_id, 
          to_position_id, 
          transfer_date 
        });
      });
      updateStmt.finalize();
    });
    stmt.finalize();
  });
});

// 删除岗位调动记录
app.delete('/api/position-transfers/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM position_transfers WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
  stmt.finalize();
});

// 离职管理
// 获取所有离职记录
app.get('/api/resignations', (req, res) => {
  const sql = `
    SELECT r.*, e.name as employee_name, e.employee_id, d.name as department_name, p.name as position_name
    FROM resignations r
    JOIN employees e ON r.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    ORDER BY r.id DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加离职记录
app.post('/api/resignations', (req, res) => {
  const { employee_id, resignation_date, reason, notes, approved_by } = req.body;
  
  // 开始事务处理
  db.serialize(() => {
    // 插入离职记录
    const stmt = db.prepare('INSERT INTO resignations (employee_id, resignation_date, reason, notes, approved_by) VALUES (?, ?, ?, ?, ?)');
    stmt.run([employee_id, resignation_date, reason, notes, approved_by], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // 更新员工状态为已离职
      const updateStmt = db.prepare("UPDATE employees SET status = 'resigned' WHERE id = ?");
      updateStmt.run([employee_id], function(updateErr) {
        if (updateErr) {
          res.status(500).json({ error: updateErr.message });
          return;
        }
        
        res.json({ 
          id: this.lastID, 
          employee_id, 
          resignation_date, 
          reason 
        });
      });
      updateStmt.finalize();
    });
    stmt.finalize();
  });
});

// 删除离职记录
app.delete('/api/resignations/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('DELETE FROM resignations WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
  stmt.finalize();
});

// 报表管理
// 新聘员工报表
app.get('/api/reports/new-hires', (req, res) => {
  const { start_date, end_date } = req.query;
  let sql = `
    SELECT e.*, d.name as department_name, p.name as position_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    WHERE e.hire_date BETWEEN ? AND ?
    ORDER BY e.hire_date DESC
  `;
  
  db.all(sql, [start_date, end_date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 离职员工报表
app.get('/api/reports/resignations', (req, res) => {
  const { start_date, end_date } = req.query;
  let sql = `
    SELECT r.*, e.name as employee_name, e.employee_id, d.name as department_name, p.name as position_name
    FROM resignations r
    JOIN employees e ON r.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    WHERE r.resignation_date BETWEEN ? AND ?
    ORDER BY r.resignation_date DESC
  `;
  
  db.all(sql, [start_date, end_date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 岗位调动报表
app.get('/api/reports/transfers', (req, res) => {
  const { start_date, end_date } = req.query;
  let sql = `
    SELECT pt.*, 
           e.name as employee_name,
           e.employee_id,
           from_d.name as from_department_name,
           from_p.name as from_position_name,
           to_d.name as to_department_name,
           to_p.name as to_position_name
    FROM position_transfers pt
    JOIN employees e ON pt.employee_id = e.id
    LEFT JOIN departments from_d ON pt.from_department_id = from_d.id
    LEFT JOIN positions from_p ON pt.from_position_id = from_p.id
    LEFT JOIN departments to_d ON pt.to_department_id = to_d.id
    LEFT JOIN positions to_p ON pt.to_position_id = to_p.id
    WHERE pt.transfer_date BETWEEN ? AND ?
    ORDER BY pt.transfer_date DESC
  `;
  
  db.all(sql, [start_date, end_date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 静态文件服务
app.use(express.static('public'));

// 启动服务器
app.listen(port, () => {
  console.log(`人力资源管理系统服务器运行在 http://localhost:${port}`);
});