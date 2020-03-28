const App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
  },

  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to MetaMask");
      return;
    }
    // for modern dapp browsers

    if (window.ethereum) {
      try {
        // request account access if needed
        await ethereum.enable();

        // Accounts now exposed
        // web3.eth.sendTransaction();
      } catch (error) {
        console.log("_____________Error Here__________", error);
      }
    }

    // for legacy dapps browsers
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      //   web3.eth.sendTransaction({});
    } else {
      console.log("_____________Non Ethereum browser detected__________");
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0];
  },

  loadContract: async () => {
    // Create the Javascript version of smart contract
    const todoList = await $.getJSON("TodoList.json");
    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(App.web3Provider);

    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed();
  },
  render: async () => {
    // Prevent double render
    if (App.loading) {
      return;
    }

    App.setLoading(true);

    // Render Account
    $("#account").html(App.account);

    // Render Tasks
    await App.renderTasks();

    // Update loading state
    App.setLoading(false);
  },

  renderTasks: async () => {
    // load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount();
    const $taskTemplate = $(".taskTemplate");

    // Render out each task with a new task template;
    for (let i = 1; i <= taskCount; i++) {
      // Fetch the task from the blockchain
      const task = await App.todoList.tasks(i);
      // FIXME: This might throw error
      const [id, taskContent, taskCompleted] = task;
      const taskId = id.toNumber();

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find(".content").html(taskContent);
      $newTaskTemplate
        .find("input")
        .prop("name", taskId)
        .prop("checked", taskCompleted)
        .on("click", App.toggleCompleted);

      // put the task in correct list

      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
      } else {
        $("#taskList").append($newTaskTemplate);
      }

      // Show the task List
      $newTaskTemplate.show();
    }
  },
  setLoading: boolean => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
  createTask: async () => {
    App.setLoading(true);
    const content = $("#newTask").val();
    await App.todoList.createTask(content);
    window.location.reload();
  },
  toggleCompleted: async e => {
    App.setLoading(true);
    const taskId = e.target.name;
    await App.todoList.toggleCompleted(taskId);
    window.location.reload();
  }
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
