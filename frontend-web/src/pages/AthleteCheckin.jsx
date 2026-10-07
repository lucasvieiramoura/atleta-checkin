import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Loader2, 
  ClipboardList 
} from "lucide-react";
import api from "../api/axios";

export default function AthleteCheckin() {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("@AtletaCheckin:user") || "{}");

  useEffect(() => {
    if (user.role === "COACH") {
      navigate("/dashboard");
      return;
    }

    fetchTodayWorkoutAndForm();
  }, []);

  const fetchTodayWorkoutAndForm = async () => {
    try {
      setLoading(true);
      setError("");

      const workoutRes = await api.get("/workouts/today");

      if (workoutRes.data && workoutRes.data.workout) {
        const workout = workoutRes.data.workout;
        setTodayWorkout(workout);
        setCheckedIn(workoutRes.data.hasCheckedIn || false);

        if (workout.formId) {
          try {
            const formRes = await api.get(`/forms/${workout.formId}`);
            setForm(formRes.data);

            // Inicializa as respostas com o valor padrão "5" caso o atleta não mova o slider
            if (formRes.data?.questions) {
              const initialAnswers = {};
              formRes.data.questions.forEach((q, index) => {
                const qKey = q._id || q.id || index;
                initialAnswers[qKey] = "5";
              });
              setAnswers(initialAnswers);
            }
          } catch (formErr) {
            console.error("Erro ao carregar o formulário vinculado:", formErr);
          }
        }
      } else {
        setTodayWorkout(null);
      }
    } catch (err) {
      console.error("Erro ao buscar treino do dia:", err);
      setError(
        err.response?.data?.message || "Erro ao carregar o treino de hoje."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Envia a Presença e o Formulário juntos em uma única requisição
  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!todayWorkout) return;

    try {
      setCheckinLoading(true);
      setError("");
      setSuccessMsg("");

      let formAnswersArray = null;

      // Monta o array de respostas no formato esperado pelo backend
      if (form && form.questions && form.questions.length > 0) {
        formAnswersArray = form.questions.map((q, idx) => {
          const qKey = q._id || q.id || idx;
          return {
            questionId: q._id || q.id || idx,
            questionText: q.label || q.title || q,
            value: String(answers[qKey] ?? "5"),
          };
        });
      }

      // Payload exato esperado pelo controller 'checkIn' do seu backend
      const payload = {
        workoutId: todayWorkout._id,
        formAnswers: formAnswersArray,
      };

      await api.post("/attendance/checkin", payload);

      setCheckedIn(true);
      setSuccessMsg("Presença e formulário salvos com sucesso! Bom treino 💪");
    } catch (err) {
      console.error("Erro ao realizar check-in:", err);
      setError(
        err.response?.data?.message || "Não foi possível realizar o check-in."
      );
    } finally {
      setCheckinLoading(false);
    }
  };

  const formattedDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Topbar */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold text-white">Atleta Check-in</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-200">{user.name}</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-800/60 text-indigo-300 border border-indigo-700">
                {user.position || "Atleta"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Cabeçalho da Data */}
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold capitalize">
              {formattedDate}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Treino do Dia</h2>
          </div>

          {/* Alertas */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm">Buscando programação de hoje...</p>
            </div>
          ) : todayWorkout ? (
            <form onSubmit={handleCheckin} className="space-y-6">
              {/* Detalhes do Treino */}
              <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold text-indigo-400">
                    {todayWorkout.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {new Date(todayWorkout.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <p className="text-gray-400 text-sm">
                  {todayWorkout.description || "Sem observações para este treino."}
                </p>

                {todayWorkout.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-800/80 pt-3 mt-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{todayWorkout.location}</span>
                  </div>
                )}
              </div>

              {/* Seção do Formulário Pré-Treino */}
              {form && form.questions && form.questions.length > 0 && !checkedIn && (
                <div className="bg-gray-950/80 p-5 rounded-xl border border-gray-800 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    <ClipboardList className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-semibold text-white">
                      {form.title || "Formulário Pré-Treino"}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {form.questions.map((q, idx) => {
                      const id = q._id || q.id || idx;
                      return (
                        <div
                          key={id}
                          className="space-y-2 bg-gray-900/60 p-3.5 rounded-xl border border-gray-800"
                        >
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-200">
                              {q.label || q.title || q}
                            </label>
                            <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                              {answers[id] ?? "5"}
                            </span>
                          </div>

                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={answers[id] ?? "5"}
                            onChange={(e) => handleInputChange(id, e.target.value)}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />

                          <div className="flex justify-between text-[10px] text-gray-500 font-semibold px-0.5">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                            <span>6</span>
                            <span>7</span>
                            <span>8</span>
                            <span>9</span>
                            <span>10</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botão de Presença */}
              {checkedIn ? (
                <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle className="w-5 h-5" />
                  Presença Confirmada
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={checkinLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {checkinLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Confirmar Presença no Treino"
                  )}
                </button>
              )}
            </form>
          ) : (
            <div className="py-10 text-center space-y-3 bg-gray-950 rounded-xl border border-gray-800 p-6">
              <Calendar className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-gray-300 font-medium">
                Nenhum treino agendado para hoje.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}