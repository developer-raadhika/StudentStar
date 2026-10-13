
import {createContext, useContext, useEffect, useState,} from "react";

import {BrowserRouter, Routes, Route, Link, Navigate,} from "react-router-dom";

import "./App.css";

// 1. Student Data
const students = [
  { id: 101, name: "Reka", course: "Full Stack Development", year: "Year 2", color: "#8b5cf6", },
  { id: 102, name: "Manimaran", course: "UI/UX Design", year: "Year 1", color: "#ec4899", },
  { id: 103, name: "Sekar", course: "Data Science", year: "Year 3", color: "#06b6d4", },
  { id: 104, name: "Kirshna", course: "Web Development", year: "Year 2", color: "#f59e0b", },
  { id: 105, name: "Raadhika", course: "Cyber Security", year: "Year 1", color: "#10b981", },
  { id: 106, name: "Mathiyazhagan", course: "Full Stack Development", year: "Year 3", color: "#f43f5e", },
  { id: 107, name: "Ezhil", course: "Cloud Computing", year: "Year 2", color: "#6366f1", },
  { id: 108, name: "Tharunthej", course: "Data Science", year: "Year 1", color: "#14b8a6", },
];

// 2. Create Student Context
const StudentContext = createContext();

// 3. Global State Provider
function StudentProvider({ children }) {
  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem(
        "studentStarFavourites"
      );

      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save favourites in localStorage
  useEffect(() => {
    localStorage.setItem(
      "studentStarFavourites",
      JSON.stringify(favourites)
    );
  }, [favourites]);

  // Add favourite without duplicates
  function addFavourite(student) {
    setFavourites((current) => {
      const alreadyExists = current.some(
        (item) => item.id === student.id
      );

      if (alreadyExists) {
        return current;
      }

      return [...current, student];
    });
  }

  // Remove favourite
  function removeFavourite(id) {
    setFavourites((current) =>
      current.filter((student) => student.id !== id)
    );
  }

  return (
    <StudentContext.Provider
      value={{
        favourites,
        addFavourite,
        removeFavourite,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

// 4. Reusable Student Card
function StudentCard({
  student,
  isFavourite,
  onToggle,
}) {
  const initials = student.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <article className="student-card">
      <div
        className="avatar"
        style={{ background: student.color }}
      >
        {initials}
      </div>

      <h2>{student.name}</h2>

      <p>Roll No: {student.id}</p>

      <p>{student.course}</p>

      <span className="year-badge">
        {student.year}
      </span>

      <button
        className={isFavourite ? "saved" : ""}
        onClick={() => onToggle(student)}
      >
        {isFavourite
          ? "♥ Added to Favourites"
          : "♡ Add to Favourite"}
      </button>
    </article>
  );
}

// 5. Navigation Bar
function Navbar() {
  const { favourites } = useContext(StudentContext);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        ✦ StudentStar
      </Link>

      <div>
        <Link to="/">Students</Link>

        <Link to="/favourites">
          ♥ Favourites ({favourites.length})
        </Link>
      </div>
    </nav>
  );
}

// 6. Student List Page
function StudentList() {
  const {
    favourites,
    addFavourite,
    removeFavourite,
  } = useContext(StudentContext);

  const [search, setSearch] = useState("");

  // Search by name, roll number, or course
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.id} ${student.course}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  function toggleFavourite(student) {
    const alreadySaved = favourites.some(
      (item) => item.id === student.id
    );

    if (alreadySaved) {
      removeFavourite(student.id);
    } else {
      addFavourite(student);
    }
  }

  return (
    <main className="page">
      <h1>
        Discover Your Star Students ✨
      </h1>

      <p>
        Explore students and build your favourite collection.
      </p>

      {/* Search Bar */}
      <input
        className="search-input"
        type="text"
        placeholder="🔍 Search by name, roll number, or course..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search students"
      />

      <div className="student-grid">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const isFavourite = favourites.some(
              (item) => item.id === student.id
            );

            return (
              <StudentCard
                key={student.id}
                student={student}
                isFavourite={isFavourite}
                onToggle={toggleFavourite}
              />
            );
          })
        ) : (
          <p className="empty">
            No students found. Try another search!
          </p>
        )}
      </div>
    </main>
  );
}

// 7. Favourite Students Page
function FavouriteStudents() {
  const { favourites, removeFavourite } =
    useContext(StudentContext);

  return (
    <main className="page">
      <h1>My Favourite Students ♥</h1>

      <p>
        Your favourite students, all in one place.
      </p>

      {favourites.length > 0 ? (
        <div className="student-grid">
          {favourites.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              isFavourite={true}
              onToggle={() =>
                removeFavourite(student.id)
              }
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>No favourite students added yet</h2>

          <p>
            Your collection is waiting for you!
            Explore the student directory and add
            your favourite students.
          </p>

          <Link to="/" className="explore-btn">
            Explore Students →
          </Link>
        </div>
      )}
    </main>
  );
}

// 8. Main Application
export default function App() {
  return (
    <BrowserRouter>
      <StudentProvider>
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<StudentList />}
          />

          <Route
            path="/favourites"
            element={<FavouriteStudents />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>

        <footer>
          <p>
            ✦ StudentStar — Celebrate Every Student.
          </p>
        </footer>
      </StudentProvider>
    </BrowserRouter>
  );
}
