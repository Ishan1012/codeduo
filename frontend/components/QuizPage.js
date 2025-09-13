import React, { useState, useEffect } from 'react';
import { Clock, Code, Target, Trophy, Share2, Home, RotateCcw, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { quizQuestions } from '@/services/QuizService';
import '@/styles/QuizPage.css';

const QuizPage = () => {
    const router = useRouter();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isQuizComplete, setIsQuizComplete] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [showResults, setShowResults] = useState(false);

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0 && !isQuizComplete && !showResults) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isQuizComplete) {
            handleNextQuestion();
        }
    }, [timeLeft, isQuizComplete, showResults]);

    const handleAnswerSelect = (answerIndex) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(answerIndex);

        const isCorrect = answerIndex === quizQuestions[currentQuestion].correctAnswer;
        const newAnswer = {
            questionId: quizQuestions[currentQuestion].id,
            selected: answerIndex,
            correct: quizQuestions[currentQuestion].correctAnswer,
            isCorrect: isCorrect,
            timeRemaining: timeLeft
        };

        setUserAnswers([...userAnswers, newAnswer]);

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            setMaxStreak(Math.max(maxStreak, newStreak));

            // Calculate multiplier based on streak
            const newMultiplier = Math.min(Math.floor(newStreak / 3) + 1, 5);
            setMultiplier(newMultiplier);

            // Calculate points (base 100, multiplied by streak multiplier, time bonus)
            const timeBonus = Math.floor(timeLeft / 5);
            const points = (100 + timeBonus) * newMultiplier;
            setScore(score + points);
        } else {
            setStreak(0);
            setMultiplier(1);
        }

        // Auto advance after 2 seconds
        setTimeout(() => {
            handleNextQuestion();
        }, 2000);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setTimeLeft(30);
        } else {
            setIsQuizComplete(true);
            setTimeout(() => setShowResults(true), 1000);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setScore(0);
        setTimeLeft(30);
        setIsQuizComplete(false);
        setUserAnswers([]);
        setStreak(0);
        setMaxStreak(0);
        setMultiplier(1);
        setShowResults(false);
    };

    const getScoreGrade = () => {
        const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
        const percentage = (correctAnswers / quizQuestions.length) * 100;

        if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
        if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
    };

    const openPage = (link) => {
        router.push(link);
    }

    const shareScore = () => {
        const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
        const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
        const text = `🎯 Just scored ${percentage}% on CodeDuo's Data Structures & Algorithms quiz! Max streak: ${maxStreak} 🔥 Can you beat my score? Try it now!`;

        if (navigator.share) {
            navigator.share({
                title: 'CodeDuo Quiz Results',
                text: text,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(text);
            alert('Score copied to clipboard!');
        }
    };

    if (showResults) {
        const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
        const percentage = Math.round((correctAnswers / quizQuestions.length) * 100);
        const scoreGrade = getScoreGrade();

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Code className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
                                <p className="text-gray-600">Data Structures & Algorithms</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-12 text-center">
                            <div className={`inline-flex items-center justify-center w-20 h-20 ${scoreGrade.bg} rounded-full mb-4`}>
                                <span className={`text-3xl font-bold ${scoreGrade.color}`}>{scoreGrade.grade}</span>
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-2">{percentage}%</h2>
                            <p className="text-purple-100 text-lg">
                                {correctAnswers} out of {quizQuestions.length} questions correct
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">{score.toLocaleString()}</div>
                                    <div className="text-gray-600 text-sm">Total Points</div>
                                </div>

                                <div className="text-center p-4 bg-orange-50 rounded-xl">
                                    <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">{maxStreak}</div>
                                    <div className="text-gray-600 text-sm">Max Streak</div>
                                </div>

                                <div className="text-center p-4 bg-blue-50 rounded-xl">
                                    <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">#24</div>
                                    <div className="text-gray-600 text-sm">Your Rank</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={shareScore}
                                    className="bg-gradient-to-r cursor-pointer from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span>Share Score</span>
                                </button>

                                <button
                                    onClick={restartQuiz}
                                    className="bg-white text-purple-600 cursor-pointer px-6 py-3 rounded-lg font-semibold border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    <span>Try Again</span>
                                </button>

                                <button
                                    onClick={() => openPage('/dashboard')}
                                    className="bg-gray-100 cursor-pointer text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Home className="w-5 h-5" />
                                    <span>Dashboard</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white rounded-xl border border-purple-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                            Global Leaderboard
                        </h3>

                        <div className="space-y-3">
                            {[
                                { rank: 1, name: 'Sarah Chen', score: 18420, streak: 15, avatar: 'SC' },
                                { rank: 2, name: 'Mike Rodriguez', score: 17850, streak: 12, avatar: 'MR' },
                                { rank: 3, name: 'Emma Thompson', score: 17200, streak: 10, avatar: 'ET' },
                                { rank: 24, name: 'You', score: score, streak: maxStreak, avatar: 'YU', isUser: true },
                                { rank: 25, name: 'Alex Johnson', score: score - 150, streak: maxStreak - 1, avatar: 'AJ' }
                            ].map((user, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${user.isUser ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                            user.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                user.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                    user.isUser ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {user.rank}
                                        </div>

                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-purple-600">{user.avatar}</span>
                                        </div>

                                        <div>
                                            <div className={`font-semibold ${user.isUser ? 'text-purple-700' : 'text-gray-800'}`}>
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-gray-500">Streak: {user.streak}</div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold text-gray-800">{user.score.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isQuizComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                    <p className="text-gray-600">Calculating your results...</p>
                </div>
            </div>
        );
    }

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
    const currentQ = quizQuestions[currentQuestion];

    return (
        <div className="min-h-screen moving-bg">
            <div className="max-w-4xl mx-auto px-6 py-8">

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                            Question {currentQuestion + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Timer and Streak */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            <Clock className="w-5 h-5" />
                            <span className="font-semibold text-lg">{timeLeft}s</span>
                        </div>

                        {streak > 0 && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                                <Zap className="w-5 h-5" />
                                <span className="font-semibold">{streak} Streak!</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8 mb-8">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                            {currentQ.question}
                        </h2>
                    </div>

                    {/* Door Options - Game Style */}
                    <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-8 py-4">
                        {currentQ.options.map((option, index) => {
                            // Base door styling
                            const baseClasses = "group relative w-full max-w-xs max-h-xs h-80 md:w-40 md:h-60 border-4 rounded-t-[3rem] flex flex-col justify-between items-center cursor-pointer transition-all duration-500 transform hover:scale-105";
                            
                            let doorClasses = "";
                            let doorHandle = "";
                            let doorShadow = "";
                            
                            if (selectedAnswer === null) {
                                // Mystery doors - rich brown wooden texture
                                doorClasses = "bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 border-amber-700 text-white hover:from-amber-700 hover:via-amber-800 hover:to-amber-900 hover:shadow-2xl hover:shadow-amber-500/30";
                                doorHandle = "bg-yellow-600 shadow-lg shadow-yellow-600/50";
                                doorShadow = "shadow-xl shadow-amber-900/50";
                            } else if (index === currentQ.correctAnswer) {
                                // Winning door - magical green
                                doorClasses = "bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600 border-emerald-400 text-white shadow-2xl shadow-emerald-400/60 animate-pulse";
                                doorHandle = "bg-yellow-400 animate-spin shadow-lg shadow-yellow-400/50";
                                doorShadow = "shadow-2xl shadow-emerald-500/70";
                            } else if (index === selectedAnswer) {
                                // Wrong door - dramatic red
                                doorClasses = "bg-gradient-to-b from-red-500 via-red-600 to-red-700 border-red-400 text-white shadow-xl shadow-red-500/50";
                                doorHandle = "bg-gray-600 shadow-lg";
                                doorShadow = "shadow-xl shadow-red-600/50";
                            } else {
                                // Other doors fade away
                                doorClasses = "bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 border-gray-600 text-gray-400 opacity-40 cursor-default";
                                doorHandle = "bg-gray-500";
                                doorShadow = "shadow-lg shadow-gray-700/30";
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={selectedAnswer !== null}
                                    className={`${baseClasses} ${doorClasses} ${doorShadow}`}
                                >
                                    {/* Door Number/Letter at top */}
                                    <div className="mt-6 w-12 h-12 rounded-full bg-black/20 flex items-center justify-center border-2 border-white/30">
                                        <span className="font-bold text-xl text-white">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                    </div>
                                    
                                    {/* Door Handle */}
                                    <div className={`absolute right-4 top-1/2 w-4 h-8 rounded-full ${doorHandle} transform -translate-y-1/2`}></div>
                                    
                                    {/* Answer Text */}
                                    <div className="px-4 mb-8 text-center">
                                        <span className="font-bold text-lg leading-tight block">
                                            {option}
                                        </span>
                                    </div>
                                    
                                    {/* Door Frame Details */}
                                    <div className="absolute inset-2 border-2 border-white/10 rounded-t-[2.5rem] pointer-events-none"></div>
                                    
                                    {/* Feedback Icons */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        {selectedAnswer !== null && index === currentQ.correctAnswer && (
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce">
                                                <CheckCircle className="w-10 h-10 text-green-500" />
                                            </div>
                                        )}
                                        {selectedAnswer === index && selectedAnswer !== currentQ.correctAnswer && (
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse">
                                                <XCircle className="w-10 h-10 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Magical glow effect for hover */}
                                    {selectedAnswer === null && (
                                        <div className="absolute inset-0 rounded-t-[3rem] bg-gradient-to-t from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Auto-advance indicator */}
                {selectedAnswer !== null && (
                    <div className="text-center text-gray-500 text-sm">
                        Next question loading automatically...
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;