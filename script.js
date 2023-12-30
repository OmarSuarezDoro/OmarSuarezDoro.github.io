//test
Quiz = function () {
    var checkbox = false;
    
    function begin() {
        // Get number of questions from input
        var questionAmount = $('#question_amount').val();
        var totalQuestions = Questions.getAllQuestions().length;

        if (questionAmount <= 0 || questionAmount == '') {
            questionAmount = 1;
        }
        else if (questionAmount > totalQuestions) {
            questionAmount = totalQuestions;
        }

        // Pick questionAmount random questions
        Questions.resetRandomQuestions();
        Questions.resetIncorrectRegister();
        for (var i = 0; i < questionAmount; i++) {
            Questions.pushRandomQuestion();
        }

        Questions.nextQuestion();
        Counters.updateCounters();

        // Display quiz
        $('#container_quiz').show();
        if (checkbox != true) {
            $('#counter_container').hide();
        }
        else {
            $('#counter_container').show();
        }
        $('#container_menu').hide();
        Timer.resetTimer();
        Timer.startTimer();
    }

    function check() {
        checkbox = !checkbox;
        console.log(checkbox);
    }
    function getCheck() {
        return checkbox;
    }
    return {
        begin: begin,
        check: check,
        getCheck: getCheck
    }
}();



Questions = function () {
    var allQuestions = new Array();
    var randomQuestions = new Array();
    var questionIncorrectRegister = new Array();
    
    function loadQuestions(name = 'No selected') {

        //regex to remove questions/ from the name string
        var regex = /questions\//;
        var name_2 = name.replace(regex, '');


        $("#selected-name").html(name_2);
        allQuestions = [];
        $.getJSON(name, function (data) {
            console.log(data);
            allQuestions = data.questions;
        });
    };

    function loadRandomQuestion() {
        var randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
        // remove the question from the array
        allQuestions.splice(allQuestions.indexOf(randomQuestion), 1);
        return randomQuestion;

    };

    function nextQuestion() {
        // Check if there are any questions left
        if (randomQuestions.length == CurrentQuestion.getIndex()) {
            // If there are no questions left, show the results
            var resultString = '<h2>Resultados</h2><br>';
            resultString += '<p>Has obtenido ' + Counters.getCorrectCounter() + ' preguntas correctas y ' + Counters.getIncorrectCounter() + ' preguntas incorrectas.</p>'; 
            resultString += '<p>Tu nota es de un ' + Math.round((Counters.getCorrectCounter() / (Counters.getCorrectCounter() + Counters.getIncorrectCounter())) * 100) + '% </p>';
            resultString += '<p> En un tiempo de: ' + Timer.getMinutes() + ' minutos y ' + Timer.getSeconds() + ' segundos.</p>';
            resultString += '<h3>Preguntas contestadas incorrectamente</h3>';
            for(var i = 0; i < questionIncorrectRegister.length; i++) {
                resultString += '<p>' + questionIncorrectRegister[i].name + '</p>';
                resultString += '<p>Tu respuesta: ' + questionIncorrectRegister[i].answers[questionIncorrectRegister[i].userAnswerIndex].name + '</p>';
                resultString += '<p>Respuesta correcta: ' + questionIncorrectRegister[i].answers[questionIncorrectRegister[i].answerIndex].name + '</p>';
                resultString += '<br>';
            }
            Timer.stopTimer();
            Questions.loadQuestions('questions/' + document.getElementById("selected-name").innerHTML);
            showModal('Cuestionario finalizado',  resultString, 'Felicidades!');
            return;
        };

        // Load the next question
        CurrentQuestion.setCurrentQuestion(randomQuestions[CurrentQuestion.getIndex()]);
        CurrentQuestion.addIndex();
        // Update name and question counters
        $('#question_name').html(CurrentQuestion.getCurrentQuestion().name);

        // Load the answers
        Questions.loadAnswers();
    };

    function loadAnswers() {
        // Clear the answers
        $('#answers_container').empty();
        // Load the answers
        for (var i = 0; i < CurrentQuestion.getCurrentQuestion().answers.length; i++) {
            var answer = CurrentQuestion.getCurrentQuestion().answers[i];
            $('#answers_container').append('<button class="button" id="answer_' + i + '">' + answer.name + '</button>');

            // Add click event to answer
            $('#answer_' + i).click(function () {
                var answerIndex = $(this).attr('id').split('_')[1];

                // Check if the answer is correct by comparing index
                if (CurrentQuestion.getCurrentQuestion().answerIndex == answerIndex) {
                    // Correct answer
                    Counters.addCorrect();
                    CurrentQuestion.getCurrentQuestion().userAnswerIndex = answerIndex;
                    if (Quiz.getCheck() == true) Audio.playCorrect();
                } else {
                    // Incorrect answer
                    Counters.addIncorrect();
                    CurrentQuestion.getCurrentQuestion().userAnswerIndex = answerIndex;
                    questionIncorrectRegister.push(CurrentQuestion.getCurrentQuestion());
                    
                    if (Quiz.getCheck() == true) Audio.playIncorrect();
                }

                // Update counters
                if (Quiz.getCheck() == true) Counters.updateCounters();
                Counters.updateTotal();

                // Load the next question
                Questions.nextQuestion();
            });
        }
    }

    function getAllQuestions() {
        return allQuestions;
    }

    function getRandomQuestions() {
        return randomQuestions;
    }

    function setAllQuestions(questions) {
        allQuestions = questions;
    }

    function getIncorrectRegister() {
        return questionIncorrectRegister;
    }

    function pushRandomQuestion() {
        randomQuestions.push(loadRandomQuestion());
    }
    function resetRandomQuestions() {
        randomQuestions = new Array();
    }
    function resetIncorrectRegister() {
        questionIncorrectRegister = new Array();
    }


    return {
        loadQuestions: loadQuestions,
        loadRandomQuestion: loadRandomQuestion,
        nextQuestion: nextQuestion,
        loadAnswers: loadAnswers,
        getAllQuestions: getAllQuestions,
        getRandomQuestions: getRandomQuestions,
        setAllQuestions:setAllQuestions,
        getIncorrectRegister: getIncorrectRegister,
        pushRandomQuestion: pushRandomQuestion,
        resetRandomQuestions: resetRandomQuestions,
        resetIncorrectRegister: resetIncorrectRegister
    }
}();

CurrentQuestion = function () {
    var currentQuestionIndex = 0;
    var currentQuestion;

    function getCurrentQuestion() {
        return currentQuestion;
    }
    function addIndex(index) {
        currentQuestionIndex++;
    }
    function getIndex() {
        return currentQuestionIndex;
    }
    function setCurrentQuestion(question) {
        currentQuestion = question;
    }
    function setIndex(index) {
        currentQuestionIndex = index;
    }

    return {
        getCurrentQuestion: getCurrentQuestion,
        addIndex: addIndex,
        getIndex: getIndex,
        setCurrentQuestion: setCurrentQuestion,
        setIndex: setIndex
    }
}();

Counters = function () {
    const correct_id = "#counter_correct";
    const incorrect_id = "#counter_incorrect";
    const total_id = "#counter_total";
    var correct_counter = 0;
    var incorrect_counter = 0;
    function init() {
        correct_counter = 0;
        incorrect_counter = 0;
    }
    function addCorrect() {
        correct_counter++;
    }
    function addIncorrect() {
        incorrect_counter++;
    }

    function updateCounters() {
        $(correct_id).html(correct_counter);
        $(incorrect_id).html(incorrect_counter);
        $(total_id).html(correct_counter + incorrect_counter);
    }
    function getCorrectCounter() {
        return correct_counter;
    }
    function getIncorrectCounter() {
        return incorrect_counter;
    }
    function setCorrectCounter(counter) {
        correct_counter = counter;
    }
    function setIncorrectCounter(counter) {
        incorrect_counter = counter;
    }

    function updateTotal() {
        $(total_id).html(correct_counter + incorrect_counter);
    }


    return {
        init: init,
        addCorrect: addCorrect,
        addIncorrect: addIncorrect,
        updateCounters: updateCounters,
        getCorrectCounter: getCorrectCounter,
        getIncorrectCounter: getIncorrectCounter,
        setCorrectCounter: setCorrectCounter,
        setIncorrectCounter: setIncorrectCounter,
        updateTotal: updateTotal
    }
}();

Audio = function () {
    const audio_correct = new Audio("assets/correct.mp3")
    const audio_incorrect = new Audio("assets/incorrect.mp3")
    //const secret_audio = new Audio("assets/secret_song.mp3")

    function playCorrect() {
        audio_correct.play();
    }
    function playIncorrect() {
        audio_incorrect.play();
    }

    return {
        playCorrect: playCorrect,
        playIncorrect: playIncorrect
    }
}();

// Modals
function showModal(header, content, footer) {
    $('#modal-header-text').html(header);
    $('#modal-body-text').html(content);
    $('#modal-footer-text').html(footer);
    $('#myModal').show();

    // Add click event to close button
    $('#modal-header-close').click(function () {
        $('#myModal').hide();

        // Reset counters
        Counters.setCorrectCounter(0);
        Counters.setIncorrectCounter(0);

        // Reset question index
        CurrentQuestion.setIndex(0);

        // Show menu
        $('#container_menu').show();
        $('#container_quiz').hide();
    });
}
Timer = function() {
    var [milliseconds,seconds,minutes] = [0,0,0];
    var timerRef = ".timerDisplay";
    var int = null;

    function startTimer() {
        int = setInterval(function() {
            milliseconds++;
            if (milliseconds >= 100) {
                milliseconds = 0;
                seconds++;
                if (seconds >= 60) {
                    seconds = 0;
                    minutes++;
                }
            }
            $(timerRef).html(minutes + ":" + (seconds < 10 ? "0" + seconds : seconds) + ":" + (milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds));
        }, 10);
    }

    function stopTimer() {
        clearInterval(int);
    }

    function resetTimer() {
        stopTimer();
        [milliseconds,seconds,minutes] = [0,0,0];
        $(timerRef).html(minutes + ":" + seconds + ":" + milliseconds);
    }

    function getMinutes() {
        return minutes;
    }

    function getSeconds() {
        return seconds;
    }


    return {
        startTimer: startTimer,
        resetTimer: resetTimer,
        stopTimer: stopTimer,
        getMinutes: getMinutes,
        getSeconds: getSeconds
    }

}();

// Load questions 
$(document).ready(function () {
    Questions.loadQuestions();
});








