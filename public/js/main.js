// 全局变量
let currentPage = 'dashboard';
let departments = [];
let positions = [];
let employees = [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 绑定导航事件
    bindNavigationEvents();
    
    // 绑定表单提交事件
    bindFormEvents();
    
    // 绑定模态框事件
    bindModalEvents();
    
    // 加载初始数据
    loadInitialData();
});

// 初始化页面
function initPage() {
    showPage(currentPage);
    loadDashboardData();
}

// 绑定导航事件
function bindNavigationEvents() {
    // 侧边栏导航
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
}

// 显示指定页面
function showPage(page) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // 显示指定页面
    document.getElementById(page).classList.add('active');
    
    // 更新当前页面
    currentPage = page;
    
    // 根据页面加载相应数据
    switch(page) {
        case 'departments':
            loadDepartments();
            break;
        case 'positions':
            loadPositions();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'probation':
            loadProbationPeriods();
            break;
        case 'transfers':
            loadPositionTransfers();
            break;
        case 'resignations':
            loadResignations();
            break;
        case 'reports':
            // 报表页面不需要自动加载数据
            break;
    }
    
    // 更新活动导航链接
    document.querySelectorAll('#sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
}

// 绑定表单事件
function bindFormEvents() {
    // 部门表单提交
    document.getElementById('saveDepartmentBtn').addEventListener('click', saveDepartment);
    
    // 岗位表单提交
    document.getElementById('savePositionBtn').addEventListener('click', savePosition);
    
    // 员工表单提交
    document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployee);
    
    // 试用期表单提交
    document.getElementById('saveProbationBtn').addEventListener('click', saveProbation);
    
    // 调岗表单提交
    document.getElementById('saveTransferBtn').addEventListener('click', saveTransfer);
    
    // 离职表单提交
    document.getElementById('saveResignationBtn').addEventListener('click', saveResignation);
    
    // 报表表单提交
    document.getElementById('newHiresReportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateNewHiresReport();
    });
    
    document.getElementById('resignationsReportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateResignationsReport();
    });
    
    document.getElementById('transfersReportForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateTransfersReport();
    });
    
    // 员工选择变化时更新调岗表单
    document.getElementById('transferEmployee').addEventListener('change', function() {
        const employeeId = this.value;
        const employee = employees.find(emp => emp.id == employeeId);
        if (employee) {
            document.getElementById('transferFromDepartment').value = employee.department_id || '';
            document.getElementById('transferFromPosition').value = employee.position_id || '';
        }
    });
}

// 绑定模态框事件
function bindModalEvents() {
    // 部门模态框显示事件
    document.getElementById('departmentModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const departmentId = button ? button.getAttribute('data-id') : null;
        
        if (departmentId) {
            // 编辑模式
            const department = departments.find(d => d.id == departmentId);
            if (department) {
                document.getElementById('departmentId').value = department.id;
                document.getElementById('departmentName').value = department.name;
                document.getElementById('departmentDescription').value = department.description || '';
            }
        } else {
            // 新增模式
            document.getElementById('departmentForm').reset();
            document.getElementById('departmentId').value = '';
        }
    });
    
    // 岗位模态框显示事件
    document.getElementById('positionModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const positionId = button ? button.getAttribute('data-id') : null;
        
        // 加载部门列表
        loadDepartmentsForSelect('positionDepartment');
        
        if (positionId) {
            // 编辑模式
            const position = positions.find(p => p.id == positionId);
            if (position) {
                document.getElementById('positionId').value = position.id;
                document.getElementById('positionName').value = position.name;
                document.getElementById('positionDepartment').value = position.department_id || '';
                document.getElementById('positionDescription').value = position.description || '';
            }
        } else {
            // 新增模式
            document.getElementById('positionForm').reset();
            document.getElementById('positionId').value = '';
        }
    });
    
    // 员工模态框显示事件
    document.getElementById('employeeModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const employeeId = button ? button.getAttribute('data-id') : null;
        
        // 加载部门和岗位列表
        loadDepartmentsForSelect('employeeDepartment');
        loadPositionsForSelect('employeePosition');
        
        if (employeeId) {
            // 编辑模式
            const employee = employees.find(e => e.id == employeeId);
            if (employee) {
                document.getElementById('employeeId').value = employee.id;
                document.getElementById('employeeEmployeeId').value = employee.employee_id;
                document.getElementById('employeeName').value = employee.name;
                document.getElementById('employeeGender').value = employee.gender || '';
                document.getElementById('employeeBirthDate').value = employee.birth_date || '';
                document.getElementById('employeePhone').value = employee.phone || '';
                document.getElementById('employeeEmail').value = employee.email || '';
                document.getElementById('employeeAddress').value = employee.address || '';
                document.getElementById('employeeDepartment').value = employee.department_id || '';
                document.getElementById('employeePosition').value = employee.position_id || '';
                document.getElementById('employeeHireDate').value = employee.hire_date || '';
            }
        } else {
            // 新增模式
            document.getElementById('employeeForm').reset();
            document.getElementById('employeeId').value = '';
        }
    });
    
    // 试用期模态框显示事件
    document.getElementById('probationModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const probationId = button ? button.getAttribute('data-id') : null;
        
        // 加载员工列表
        loadEmployeesForSelect('probationEmployee');
        
        if (probationId) {
            // 编辑模式，需要先加载试用期数据
            fetch(`/api/probation-periods`).then(response => response.json()).then(data => {
                const probation = data.find(p => p.id == probationId);
                if (probation) {
                    document.getElementById('probationId').value = probation.id;
                    document.getElementById('probationEmployee').value = probation.employee_id;
                    document.getElementById('probationStartDate').value = probation.start_date;
                    document.getElementById('probationEndDate').value = probation.end_date;
                    document.getElementById('probationStatus').value = probation.status || 'ongoing';
                    document.getElementById('probationNotes').value = probation.notes || '';
                }
            });
        } else {
            // 新增模式
            document.getElementById('probationForm').reset();
            document.getElementById('probationId').value = '';
        }
    });
    
    // 调岗模态框显示事件
    document.getElementById('transferModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const transferId = button ? button.getAttribute('data-id') : null;
        
        // 加载员工、部门和岗位列表
        loadEmployeesForSelect('transferEmployee');
        loadDepartmentsForSelect('transferToDepartment');
        loadPositionsForSelect('transferToPosition');
        
        if (transferId) {
            // 编辑模式，需要先加载调动数据
            fetch(`/api/position-transfers`).then(response => response.json()).then(data => {
                const transfer = data.find(t => t.id == transferId);
                if (transfer) {
                    document.getElementById('transferId').value = transfer.id;
                    document.getElementById('transferEmployee').value = transfer.employee_id;
                    document.getElementById('transferFromDepartment').value = transfer.from_department_id || '';
                    document.getElementById('transferFromPosition').value = transfer.from_position_id || '';
                    document.getElementById('transferToDepartment').value = transfer.to_department_id || '';
                    document.getElementById('transferToPosition').value = transfer.to_position_id || '';
                    document.getElementById('transferDate').value = transfer.transfer_date;
                    document.getElementById('transferReason').value = transfer.reason || '';
                    document.getElementById('transferApprovedBy').value = transfer.approved_by || '';
                }
            });
        } else {
            // 新增模式
            document.getElementById('transferForm').reset();
            document.getElementById('transferId').value = '';
            // 清空原部门和岗位
            document.getElementById('transferFromDepartment').value = '';
            document.getElementById('transferFromPosition').value = '';
        }
    });
    
    // 离职模态框显示事件
    document.getElementById('resignationModal').addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const resignationId = button ? button.getAttribute('data-id') : null;
        
        // 加载员工列表
        loadEmployeesForSelect('resignationEmployee');
        
        if (resignationId) {
            // 编辑模式，需要先加载离职数据
            fetch(`/api/resignations`).then(response => response.json()).then(data => {
                const resignation = data.find(r => r.id == resignationId);
                if (resignation) {
                    document.getElementById('resignationId').value = resignation.id;
                    document.getElementById('resignationEmployee').value = resignation.employee_id;
                    document.getElementById('resignationDate').value = resignation.resignation_date;
                    document.getElementById('resignationReason').value = resignation.reason || '';
                    document.getElementById('resignationNotes').value = resignation.notes || '';
                    document.getElementById('resignationApprovedBy').value = resignation.approved_by || '';
                }
            });
        } else {
            // 新增模式
            document.getElementById('resignationForm').reset();
            document.getElementById('resignationId').value = '';
        }
    });
}

// 加载初始数据
function loadInitialData() {
    loadDepartments();
    loadPositions();
    loadEmployees();
}

// 加载仪表盘数据
function loadDashboardData() {
    // 加载员工统计数据
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            const total = data.length;
            const active = data.filter(e => e.status === 'active').length;
            const probation = data.filter(e => e.status === 'probation').length;
            const resigned = data.filter(e => e.status === 'resigned').length;
            
            document.getElementById('totalEmployees').textContent = total;
            document.getElementById('activeEmployees').textContent = active;
            document.getElementById('probationEmployees').textContent = probation;
            document.getElementById('resignedEmployees').textContent = resigned;
            
            // 显示最近入职员工
            const recentHires = data
                .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
                .slice(0, 5);
                
            const recentHiresTable = document.getElementById('recentHiresTable');
            recentHiresTable.innerHTML = '';
            
            if (recentHires.length === 0) {
                recentHiresTable.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
            } else {
                recentHires.forEach(employee => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${employee.employee_id}</td>
                        <td>${employee.name}</td>
                        <td>${employee.department_name || '-'}</td>
                        <td>${employee.hire_date || '-'}</td>
                    `;
                    recentHiresTable.appendChild(row);
                });
            }
        });
        
    // 加载最近离职员工
    fetch('/api/resignations')
        .then(response => response.json())
        .then(data => {
            // 获取员工信息
            fetch('/api/employees')
                .then(response => response.json())
                .then(employees => {
                    // 关联员工信息
                    const resignationsWithEmployeeInfo = data.map(resignation => {
                        const employee = employees.find(e => e.id == resignation.employee_id);
                        return {
                            ...resignation,
                            employee_name: employee ? employee.name : '-',
                            department_name: employee ? employee.department_name : '-'
                        };
                    });
                    
                    // 排序并取前5条
                    const recentResignations = resignationsWithEmployeeInfo
                        .sort((a, b) => new Date(b.resignation_date) - new Date(a.resignation_date))
                        .slice(0, 5);
                        
                    const recentResignationsTable = document.getElementById('recentResignationsTable');
                    recentResignationsTable.innerHTML = '';
                    
                    if (recentResignations.length === 0) {
                        recentResignationsTable.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
                    } else {
                        recentResignations.forEach(resignation => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${resignation.employee_id || '-'}</td>
                                <td>${resignation.employee_name}</td>
                                <td>${resignation.department_name || '-'}</td>
                                <td>${resignation.resignation_date || '-'}</td>
                            `;
                            recentResignationsTable.appendChild(row);
                        });
                    }
                });
        });
}

// 加载部门数据
function loadDepartments() {
    fetch('/api/departments')
        .then(response => response.json())
        .then(data => {
            departments = data;
            const tbody = document.getElementById('departmentsTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
                return;
            }
            
            data.forEach(department => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${department.id}</td>
                    <td>${department.name}</td>
                    <td>${department.description || '-'}</td>
                    <td>${department.created_at ? new Date(department.created_at).toLocaleDateString() : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#departmentModal" data-id="${department.id}">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${department.id})">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载部门数据出错:', error);
            const tbody = document.getElementById('departmentsTable');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">加载数据失败</td></tr>';
        });
}

// 保存部门
function saveDepartment() {
    const id = document.getElementById('departmentId').value;
    const name = document.getElementById('departmentName').value;
    const description = document.getElementById('departmentDescription').value;
    
    if (!name) {
        alert('请输入部门名称');
        return;
    }
    
    const department = { name, description };
    
    let url = '/api/departments';
    let method = 'POST';
    
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(department)
    })
    .then(response => response.json())
    .then(data => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('departmentModal'));
        modal.hide();
        
        // 重新加载部门数据
        loadDepartments();
        
        // 显示成功消息
        alert(id ? '部门更新成功' : '部门添加成功');
    })
    .catch(error => {
        console.error('保存部门出错:', error);
        alert('保存部门失败');
    });
}

// 删除部门
function deleteDepartment(id) {
    if (!confirm('确定要删除这个部门吗？')) {
        return;
    }
    
    fetch(`/api/departments/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // 重新加载部门数据
        loadDepartments();
        
        // 显示成功消息
        alert('部门删除成功');
    })
    .catch(error => {
        console.error('删除部门出错:', error);
        alert('删除部门失败');
    });
}

// 加载岗位数据
function loadPositions() {
    fetch('/api/positions')
        .then(response => response.json())
        .then(data => {
            positions = data;
            const tbody = document.getElementById('positionsTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
                return;
            }
            
            data.forEach(position => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${position.id}</td>
                    <td>${position.name}</td>
                    <td>${position.department_name || '-'}</td>
                    <td>${position.description || '-'}</td>
                    <td>${position.created_at ? new Date(position.created_at).toLocaleDateString() : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#positionModal" data-id="${position.id}">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePosition(${position.id})">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载岗位数据出错:', error);
            const tbody = document.getElementById('positionsTable');
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载数据失败</td></tr>';
        });
}

// 保存岗位
function savePosition() {
    const id = document.getElementById('positionId').value;
    const name = document.getElementById('positionName').value;
    const department_id = document.getElementById('positionDepartment').value;
    const description = document.getElementById('positionDescription').value;
    
    if (!name) {
        alert('请输入岗位名称');
        return;
    }
    
    if (!department_id) {
        alert('请选择所属部门');
        return;
    }
    
    const position = { name, department_id, description };
    
    let url = '/api/positions';
    let method = 'POST';
    
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(position)
    })
    .then(response => response.json())
    .then(data => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('positionModal'));
        modal.hide();
        
        // 重新加载岗位数据
        loadPositions();
        
        // 显示成功消息
        alert(id ? '岗位更新成功' : '岗位添加成功');
    })
    .catch(error => {
        console.error('保存岗位出错:', error);
        alert('保存岗位失败');
    });
}

// 删除岗位
function deletePosition(id) {
    if (!confirm('确定要删除这个岗位吗？')) {
        return;
    }
    
    fetch(`/api/positions/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // 重新加载岗位数据
        loadPositions();
        
        // 显示成功消息
        alert('岗位删除成功');
    })
    .catch(error => {
        console.error('删除岗位出错:', error);
        alert('删除岗位失败');
    });
}

// 加载员工数据
function loadEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            employees = data;
            const tbody = document.getElementById('employeesTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
                return;
            }
            
            data.forEach(employee => {
                // 状态中文显示
                let statusText = '未知';
                switch(employee.status) {
                    case 'active':
                        statusText = '在职';
                        break;
                    case 'probation':
                        statusText = '试用期';
                        break;
                    case 'resigned':
                        statusText = '已离职';
                        break;
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.employee_id}</td>
                    <td>${employee.name}</td>
                    <td>${employee.gender || '-'}</td>
                    <td>${employee.department_name || '-'}</td>
                    <td>${employee.position_name || '-'}</td>
                    <td>${employee.hire_date || '-'}</td>
                    <td>${statusText}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#employeeModal" data-id="${employee.id}">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${employee.id})">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载员工数据出错:', error);
            const tbody = document.getElementById('employeesTable');
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">加载数据失败</td></tr>';
        });
}

// 保存员工
function saveEmployee() {
    const id = document.getElementById('employeeId').value;
    const employee_id = document.getElementById('employeeEmployeeId').value;
    const name = document.getElementById('employeeName').value;
    const gender = document.getElementById('employeeGender').value;
    const birth_date = document.getElementById('employeeBirthDate').value;
    const phone = document.getElementById('employeePhone').value;
    const email = document.getElementById('employeeEmail').value;
    const address = document.getElementById('employeeAddress').value;
    const department_id = document.getElementById('employeeDepartment').value;
    const position_id = document.getElementById('employeePosition').value;
    const hire_date = document.getElementById('employeeHireDate').value;
    
    if (!employee_id) {
        alert('请输入员工编号');
        return;
    }
    
    if (!name) {
        alert('请输入员工姓名');
        return;
    }
    
    if (!department_id) {
        alert('请选择部门');
        return;
    }
    
    if (!position_id) {
        alert('请选择岗位');
        return;
    }
    
    if (!hire_date) {
        alert('请选择入职日期');
        return;
    }
    
    const employee = { 
        employee_id, 
        name, 
        gender, 
        birth_date, 
        phone, 
        email, 
        address, 
        department_id, 
        position_id, 
        hire_date 
    };
    
    let url = '/api/employees';
    let method = 'POST';
    
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
    })
    .then(response => response.json())
    .then(data => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
        modal.hide();
        
        // 重新加载员工数据
        loadEmployees();
        
        // 显示成功消息
        alert(id ? '员工更新成功' : '员工添加成功');
    })
    .catch(error => {
        console.error('保存员工出错:', error);
        alert('保存员工失败');
    });
}

// 删除员工
function deleteEmployee(id) {
    if (!confirm('确定要删除这个员工吗？')) {
        return;
    }
    
    fetch(`/api/employees/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // 重新加载员工数据
        loadEmployees();
        
        // 显示成功消息
        alert('员工删除成功');
    })
    .catch(error => {
        console.error('删除员工出错:', error);
        alert('删除员工失败');
    });
}

// 加载试用期数据
function loadProbationPeriods() {
    fetch('/api/probation-periods')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('probationTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
                return;
            }
            
            data.forEach(probation => {
                // 状态中文显示
                let statusText = '未知';
                switch(probation.status) {
                    case 'ongoing':
                        statusText = '进行中';
                        break;
                    case 'completed':
                        statusText = '已完成';
                        break;
                    case 'terminated':
                        statusText = '已终止';
                        break;
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${probation.id}</td>
                    <td>${probation.employee_id}</td>
                    <td>${probation.employee_name}</td>
                    <td>${probation.start_date || '-'}</td>
                    <td>${probation.end_date || '-'}</td>
                    <td>${statusText}</td>
                    <td>${probation.notes || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#probationModal" data-id="${probation.id}">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProbation(${probation.id})">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载试用期数据出错:', error);
            const tbody = document.getElementById('probationTable');
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">加载数据失败</td></tr>';
        });
}

// 保存试用期
function saveProbation() {
    const id = document.getElementById('probationId').value;
    const employee_id = document.getElementById('probationEmployee').value;
    const start_date = document.getElementById('probationStartDate').value;
    const end_date = document.getElementById('probationEndDate').value;
    const status = document.getElementById('probationStatus').value;
    const notes = document.getElementById('probationNotes').value;
    
    if (!employee_id) {
        alert('请选择员工');
        return;
    }
    
    if (!start_date) {
        alert('请选择开始日期');
        return;
    }
    
    if (!end_date) {
        alert('请选择结束日期');
        return;
    }
    
    const probation = { employee_id, start_date, end_date, status, notes };
    
    let url = '/api/probation-periods';
    let method = 'POST';
    
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(probation)
    })
    .then(response => response.json())
    .then(data => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('probationModal'));
        modal.hide();
        
        // 重新加载试用期数据
        loadProbationPeriods();
        
        // 显示成功消息
        alert(id ? '试用期记录更新成功' : '试用期记录添加成功');
    })
    .catch(error => {
        console.error('保存试用期记录出错:', error);
        alert('保存试用期记录失败');
    });
}

// 删除试用期记录
function deleteProbation(id) {
    if (!confirm('确定要删除这条试用期记录吗？')) {
        return;
    }
    
    fetch(`/api/probation-periods/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // 重新加载试用期数据
        loadProbationPeriods();
        
        // 显示成功消息
        alert('试用期记录删除成功');
    })
    .catch(error => {
        console.error('删除试用期记录出错:', error);
        alert('删除试用期记录失败');
    });
}

// 加载岗位调动数据
function loadPositionTransfers() {
    fetch('/api/position-transfers')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('transfersTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">暂无数据</td></tr>';
                return;
            }
            
            data.forEach(transfer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transfer.id}</td>
                    <td>${transfer.employee_id}</td>
                    <td>${transfer.employee_name}</td>
                    <td>${transfer.from_department_name || '-'}</td>
                    <td>${transfer.from_position_name || '-'}</td>
                    <td>${transfer.to_department_name || '-'}</td>
                    <td>${transfer.to_position_name || '-'}</td>
                    <td>${transfer.transfer_date || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#transferModal" data-id="${transfer.id}">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteTransfer(${transfer.id})">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载岗位调动数据出错:', error);
            const tbody = document.getElementById('transfersTable');
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">加载数据失败</td></tr>';
        });
}

// 保存岗位调动
function saveTransfer() {
    const id = document.getElementById('transferId').value;
    const employee_id = document.getElementById('transferEmployee').value;
    const from_department_id = document.getElementById('transferFromDepartment').value;
    const from_position_id = document.getElementById('transferFromPosition').value;
    const to_department_id = document.getElementById('transferToDepartment').value;
    const to_position_id = document.getElementById('transferToPosition').value;
    const transfer_date = document.getElementById('transferDate').value;
    const reason = document.getElementById('transferReason').value;
    const approved_by = document.getElementById('transferApprovedBy').value;
    
    if (!employee_id) {
        alert('请选择员工');
        return;
    }
    
    if (!to_department_id) {
        alert('请选择调至部门');
        return;
    }
    
    if (!to_position_id) {
        alert('请选择调至岗位');
        return;
    }
    
    if (!transfer_date) {
        alert('请选择调动日期');
        return;
    }
    
    const transfer = { 
        employee_id, 
        from_department_id, 
        from_position_id, 
        to_department_id, 
        to_position_id, 
        transfer_date, 
        reason, 
        approved_by 
    };
    
    let url = '/api/position-transfers';
    let method = 'POST';
    
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transfer)
    })
    .then(response => response.json())
    .then(data => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('transferModal'));
        modal.hide();
        
        // 重新加载岗位调动数据
        loadPositionTransfers();
        
        // 显示成功消息
        alert(id ? '岗位调动记录更新成功' : '岗位调动记录添加成功');
    })
    .catch(error => {
        console.error('保存岗位调动记录出错:', error);
        alert('保存岗位调动记录失败');
    });
}

// 删除岗位调动记录
function deleteTransfer(id) {
    if (!confirm('确定要删除这条岗位调动记录吗？')) {
        return;
    }
    
    fetch(`/api/position-transfers/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // 重新加载岗位调动数据
        loadPositionTransfers();
        
        // 显示成功消息
        alert('岗位调动记录删除成功');
    })
    .catch(error => {
        console.error('删除岗位调动记录出错:', error);
        alert('删除岗位调动记录失败');
    });
}

// 加载离职数据
function loadResignations() {
    fetch('/api/resignations')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('resignationsTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">暂无数据</td></tr>';
                return;
            }
            
            data.forEach(resignation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${resignation.id}</td>
                    <td>${resignation.employee_id}</td>
                    <td>${resignation.employee_name}</td>
                    <td>${resignation.department_name || '-'}</td>
                    <td>${resignation.position_name || '-'}</td>
                    <td>${resignation.resignation_date || '-'}</td>
                    <td>${resignation.reason || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#resignationModal" data-id="${resignation.id}">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteResignation(${resignation.id})">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('加载离职数据出错:', error);
            const tbody = document.getElementById('resignationsTable');
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">加载数据失败</td></tr>';
        });
}

// 保存离职记录
function saveResignation() {
    const id = document.getElementById('resignationId').value;
    const employee_id = document.getElementById('resignationEmployee').value;
    const resignation_date = document.getElementById('resignationDate').value;
    const reason = document.getElementById('resignationReason').value;
    const notes = document.getElementById('resignationNotes').value;
    const approved_by = document.getElementById('resignationApprovedBy').value;
    
    if (!employee_id) {
        alert('请选择员工');
        return;
    }
    
    if (!resignation_date) {
        alert('请选择离职日期');
        return;
    }
    
    const resignation = { employee_id, resignation_date, reason, notes, approved_by };
    
    let url = '/api/resignations';
    let method = 'POST';
    
    if (id) {
        url += '/' + id;
        method = 'PUT';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(resignation)
    })
    .then(response => response.json())
    .then(data => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('resignationModal'));
        modal.hide();
        
        // 重新加载离职数据
        loadResignations();
        
        // 显示成功消息
        alert(id ? '离职记录更新成功' : '离职记录添加成功');
    })
    .catch(error => {
        console.error('保存离职记录出错:', error);
        alert('保存离职记录失败');
    });
}

// 删除离职记录
function deleteResignation(id) {
    if (!confirm('确定要删除这条离职记录吗？')) {
        return;
    }
    
    fetch(`/api/resignations/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        // 重新加载离职数据
        loadResignations();
        
        // 显示成功消息
        alert('离职记录删除成功');
    })
    .catch(error => {
        console.error('删除离职记录出错:', error);
        alert('删除离职记录失败');
    });
}

// 生成新聘员工报表
function generateNewHiresReport() {
    const start_date = document.getElementById('newHiresStartDate').value;
    const end_date = document.getElementById('newHiresEndDate').value;
    
    if (!start_date || !end_date) {
        alert('请选择完整的日期范围');
        return;
    }
    
    fetch(`/api/reports/new-hires?start_date=${start_date}&end_date=${end_date}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('newHiresReportTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">该时间段内没有新聘员工</td></tr>';
                return;
            }
            
            data.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.employee_id}</td>
                    <td>${employee.name}</td>
                    <td>${employee.department_name || '-'}</td>
                    <td>${employee.position_name || '-'}</td>
                    <td>${employee.hire_date || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('生成新聘员工报表出错:', error);
            const tbody = document.getElementById('newHiresReportTable');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">生成报表失败</td></tr>';
        });
}

// 生成离职员工报表
function generateResignationsReport() {
    const start_date = document.getElementById('resignationsStartDate').value;
    const end_date = document.getElementById('resignationsEndDate').value;
    
    if (!start_date || !end_date) {
        alert('请选择完整的日期范围');
        return;
    }
    
    fetch(`/api/reports/resignations?start_date=${start_date}&end_date=${end_date}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('resignationsReportTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">该时间段内没有离职员工</td></tr>';
                return;
            }
            
            data.forEach(resignation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${resignation.employee_id}</td>
                    <td>${resignation.employee_name}</td>
                    <td>${resignation.department_name || '-'}</td>
                    <td>${resignation.position_name || '-'}</td>
                    <td>${resignation.resignation_date || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('生成离职员工报表出错:', error);
            const tbody = document.getElementById('resignationsReportTable');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">生成报表失败</td></tr>';
        });
}

// 生成岗位调动报表
function generateTransfersReport() {
    const start_date = document.getElementById('transfersStartDate').value;
    const end_date = document.getElementById('transfersEndDate').value;
    
    if (!start_date || !end_date) {
        alert('请选择完整的日期范围');
        return;
    }
    
    fetch(`/api/reports/transfers?start_date=${start_date}&end_date=${end_date}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById('transfersReportTable');
            tbody.innerHTML = '';
            
            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">该时间段内没有岗位调动记录</td></tr>';
                return;
            }
            
            data.forEach(transfer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transfer.employee_id}</td>
                    <td>${transfer.employee_name}</td>
                    <td>${transfer.from_department_name || '-'}</td>
                    <td>${transfer.to_department_name || '-'}</td>
                    <td>${transfer.transfer_date || '-'}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('生成岗位调动报表出错:', error);
            const tbody = document.getElementById('transfersReportTable');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">生成报表失败</td></tr>';
        });
}

// 辅助函数：为下拉框加载部门数据
function loadDepartmentsForSelect(selectId) {
    fetch('/api/departments')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById(selectId);
            // 保留第一个选项（提示信息）
            const firstOption = select.firstElementChild;
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            data.forEach(department => {
                const option = document.createElement('option');
                option.value = department.id;
                option.textContent = department.name;
                select.appendChild(option);
            });
        });
}

// 辅助函数：为下拉框加载岗位数据
function loadPositionsForSelect(selectId) {
    fetch('/api/positions')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById(selectId);
            // 保留第一个选项（提示信息）
            const firstOption = select.firstElementChild;
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            data.forEach(position => {
                const option = document.createElement('option');
                option.value = position.id;
                option.textContent = position.name;
                select.appendChild(option);
            });
        });
}

// 辅助函数：为下拉框加载员工数据
function loadEmployeesForSelect(selectId) {
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById(selectId);
            // 保留第一个选项（提示信息）
            const firstOption = select.firstElementChild;
            select.innerHTML = '';
            select.appendChild(firstOption);
            
            data.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = `${employee.employee_id} - ${employee.name}`;
                select.appendChild(option);
            });
        });
}