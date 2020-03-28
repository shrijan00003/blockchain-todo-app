pragma solidity >=0.4.21 <0.7.0;


contract TodoList {
    uint256 public taskCount = 0;

    constructor() public {
        createTask("Check out shrijantripathi.com.np");
    }

    event TaskCreated(uint256 id, string content, bool completed);

    event TaskCompleted(uint256 id, bool completed);

    struct Task {
        uint256 id;
        string content;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;

    function createTask(string memory _content) public {
        taskCount++; // will start from one
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }

    function toggleCompleted(uint256 _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }
}
