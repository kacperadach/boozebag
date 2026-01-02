import React, { useState, useRef, useEffect } from "react";

interface DayData {
  date: Date;
  drinks: number;
}

interface MonthData {
  year: number;
  month: number;
  days: DayData[];
}

interface DrinkingCalendarProps {
  months: MonthData[];
  stats: {
    sum: number;
    averagePerDay: number;
    drinklessDays: number;
    totalDays: number;
  };
}

const DrinkingCalendar: React.FC<DrinkingCalendarProps> = ({
  months,
  stats,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wrappedPage, setWrappedPage] = useState(0);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calculate the maximum drinks across all days
  const maxDrinks = Math.max(
    ...months.flatMap((month) => month.days.map((day) => day.drinks))
  );

  // Find the day with maximum drinks
  const maxDrinkDay = months
    .flatMap((month) => month.days)
    .find((day) => day.drinks === maxDrinks && maxDrinks > 0);

  // Calculate longest drinkless streak
  const allDays = months
    .flatMap((month) => month.days)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let longestStreak = 0;
  let currentStreak = 0;

  for (const day of allDays) {
    if (day.drinks === 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Get one-liner based on streak length
  const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "You never missed a day!";
    if (streak < 7) return "A week? That's just a warm-up.";
    if (streak < 14) return "Two weeks strong — impressive restraint!";
    if (streak < 30) return "Almost a month! Your willpower is showing.";
    if (streak < 60) return "Two months? You're basically a monk now.";
    if (streak < 90) return "Three months dry? Legendary discipline.";
    return "Over three months? You're in a league of your own.";
  };

  // Calculate holiday drink counts for 2025
  const holidayDates = {
    "New Year's Eve": new Date(2025, 11, 31), // December 31
    Thanksgiving: new Date(2025, 10, 27), // November 27 (4th Thursday)
    Halloween: new Date(2025, 9, 31), // October 31
    Christmas: new Date(2025, 11, 25), // December 25
    "July 4th": new Date(2025, 6, 4), // July 4
    "St. Patrick's Day": new Date(2025, 2, 17), // March 17
    "Valentine's Day": new Date(2025, 1, 14), // February 14
  };

  const getDrinksForDate = (date: Date): number => {
    const dayData = allDays.find(
      (day) =>
        day.date.getFullYear() === date.getFullYear() &&
        day.date.getMonth() === date.getMonth() &&
        day.date.getDate() === date.getDate()
    );
    return dayData ? dayData.drinks : 0;
  };

  const holidayDrinks = Object.entries(holidayDates)
    .map(([name, date]) => ({
      name,
      date,
      drinks: getDrinksForDate(date),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const maxHolidayDrinks = Math.max(...holidayDrinks.map((h) => h.drinks));
  const topHoliday = holidayDrinks.find((h) => h.drinks === maxHolidayDrinks);

  // Get witty message based on top holiday
  const getHolidayMessage = (holidayName: string): string => {
    switch (holidayName) {
      case "New Year's Eve":
        return "You rang in the new year with style — and several drinks.";
      case "Thanksgiving":
        return "You were truly grateful... for the open bar.";
      case "Halloween":
        return "The scariest thing about Halloween? Your bar tab.";
      case "Christmas":
        return "Santa wasn't the only one making the rounds that night.";
      case "July 4th":
        return "You celebrated independence... from sobriety.";
      case "St. Patrick's Day":
        return "The luck of the Irish? More like the luck of the bar.";
      case "Valentine's Day":
        return "Love was in the air... and so was your drink count.";
      default:
        return "You really know how to celebrate!";
    }
  };

  // Get season based on date
  const getSeason = (date: Date): string => {
    const month = date.getMonth(); // 0-11
    const day = date.getDate();

    // Spring: March 20 - June 20
    // Summer: June 21 - September 22
    // Fall: September 23 - December 20
    // Winter: December 21 - March 19

    if (month === 2 && day >= 20) return "Spring"; // March 20+
    if (month >= 3 && month <= 4) return "Spring"; // April, May
    if (month === 5 && day <= 20) return "Spring"; // June 1-20

    if (month === 5 && day >= 21) return "Summer"; // June 21+
    if (month >= 6 && month <= 8) return "Summer"; // July, August, September
    if (month === 8 && day <= 22) return "Summer"; // September 1-22

    if (month === 8 && day >= 23) return "Fall"; // September 23+
    if (month >= 9 && month <= 10) return "Fall"; // October, November
    if (month === 11 && day <= 20) return "Fall"; // December 1-20

    return "Winter"; // December 21 - March 19
  };

  // Get season message based on season
  const getSeasonMessage = (season: string): string => {
    switch (season) {
      case "Fall":
        return "Pumpkin spice? No. Pumpkin spiked.";
      case "Winter":
        return "You didn't beat seasonal depression — you outdrank it.";
      case "Spring":
        return "Flowers bloomed. So did your bar tabs.";
      case "Summer":
        return "When the days got longer, so did your drink count.";
      default:
        return `That's so ${season} of you`;
    }
  };

  // Calculate total drinks per month
  const monthlyTotals = months.map((month) =>
    month.days.reduce((sum, day) => sum + day.drinks, 0)
  );

  // Find min and max monthly totals (excluding 0)
  const nonZeroTotals = monthlyTotals.filter((total) => total > 0);
  const minMonthlyTotal =
    nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals) : 0;
  const maxMonthlyTotal =
    nonZeroTotals.length > 0 ? Math.max(...nonZeroTotals) : 0;

  // Find indices of months with min and max totals
  const minMonthIndex = monthlyTotals.findIndex(
    (total) => total === minMonthlyTotal && total > 0
  );
  const maxMonthIndex = monthlyTotals.findIndex(
    (total) => total === maxMonthlyTotal
  );

  // LERP function to map monthly total to emoji count (0-3)
  const getEmojiCount = (monthlyTotal: number): number => {
    if (monthlyTotal === 0) return 0;
    if (minMonthlyTotal === maxMonthlyTotal) return 3; // All non-zero months have same total
    // LERP: map [minMonthlyTotal, maxMonthlyTotal] to [1, 3]
    const t =
      (monthlyTotal - minMonthlyTotal) / (maxMonthlyTotal - minMonthlyTotal);
    return Math.round(1 + t * 2); // Maps to 1, 2, or 3
  };

  // Get astrological sign based on month (0-11)
  const getAstrologicalSign = (month: number): string => {
    const signs = [
      "Capricorn", // Dec 22 - Jan 19
      "Aquarius", // Jan 20 - Feb 18
      "Pisces", // Feb 19 - Mar 20
      "Aries", // Mar 21 - Apr 19
      "Taurus", // Apr 20 - May 20
      "Gemini", // May 21 - Jun 20
      "Cancer", // Jun 21 - Jul 22
      "Leo", // Jul 23 - Aug 22
      "Virgo", // Aug 23 - Sep 22
      "Libra", // Sep 23 - Oct 22
      "Scorpio", // Oct 23 - Nov 21
      "Sagittarius", // Nov 22 - Dec 21
    ];
    // Simple mapping: month index to sign
    // This is approximate - real signs depend on day ranges
    return signs[month];
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getDrinksForDay = (monthData: MonthData, day: number): number => {
    const dayData = monthData.days.find((d) => d.date.getDate() === day);
    return dayData ? dayData.drinks : 0;
  };

  const getDayData = (monthData: MonthData, day: number): DayData | null => {
    return monthData.days.find((d) => d.date.getDate() === day) || null;
  };

  const formatDate = (date: Date): string => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number): string => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${dayName}, ${monthName} ${getOrdinal(day)}, ${year}`;
  };

  const getColorIntensity = (drinks: number): React.CSSProperties => {
    if (drinks === 0) return { backgroundColor: "#d1fae5" }; // light green
    if (drinks < 3) return { backgroundColor: "#fef08a" }; // yellow
    if (drinks < 5) return { backgroundColor: "#fed7aa" }; // soft orange
    if (drinks < 8) return { backgroundColor: "#fecaca" }; // light red
    return { backgroundColor: "#ef4444" }; // darker red
  };

  const renderMonth = (monthData: MonthData, monthIndex: number) => {
    const { year, month } = monthData;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const monthlyTotal = monthlyTotals[monthIndex];
    const emojiCount = getEmojiCount(monthlyTotal);
    const emojis = "🍺".repeat(emojiCount);
    const isMinMonth = monthIndex === minMonthIndex;
    const isMaxMonth = monthIndex === maxMonthIndex;

    return (
      <div key={`${year}-${month}`} style={{ marginBottom: "12px" }}>
        <h2
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredDay({
              x: rect.left + rect.width / 2,
              y: rect.top - 5,
              text: `${
                monthNames[month]
              } ${year}\nTotal: ${monthlyTotal} drink${
                monthlyTotal !== 1 ? "s" : ""
              }`,
            });
          }}
          onMouseLeave={() => setHoveredDay(null)}
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            marginBottom: "6px",
            textAlign: "center",
            cursor: "help",
            backgroundColor: isMinMonth
              ? "#d1fae5"
              : isMaxMonth
              ? "#ef4444"
              : "transparent",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {monthNames[month]} {year} {emojis}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "2px",
          }}
        >
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: "600",
                fontSize: "9px",
                padding: "3px 0",
              }}
            >
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} style={{ aspectRatio: "1" }}></div>;
            }
            const drinks = getDrinksForDay(monthData, day);
            const colorStyle = getColorIntensity(drinks);
            const isMaxDay = drinks === maxDrinks && drinks > 0;
            const dayData = getDayData(monthData, day);
            const dateString = dayData
              ? formatDate(dayData.date)
              : `${monthNames[month]} ${day}, ${year}`;
            const tooltipLines = dayData
              ? [
                  dateString,
                  `${drinks} drink${drinks !== 1 ? "s" : ""}`,
                  ...(isMaxDay ? ["Most Drinks of the Year"] : []),
                ]
              : [
                  `${monthNames[month]} ${day}, ${year}`,
                  `${drinks} drink${drinks !== 1 ? "s" : ""}`,
                ];
            return (
              <div
                key={index}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredDay({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 5,
                    text: tooltipLines.join("\n"),
                  });
                }}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  aspectRatio: "1",
                  border: "1px solid #d1d5db",
                  outline: isMaxDay ? "3px solid #00ffff" : "none",
                  outlineOffset: isMaxDay ? "-2px" : "0",
                  borderRadius: "3px",
                  padding: "2px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  position: "relative",
                  cursor: "help",
                  ...colorStyle,
                }}
              >
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: "600",
                    marginTop: "1px",
                  }}
                >
                  {day}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {drinks}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1800px", margin: "0 auto" }}>
      {/* Statistics Section */}
      <div
        style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "6px",
          padding: "12px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Drinking Statistics
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "24px",
              flexWrap: "nowrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#4b5563",
                  marginBottom: "2px",
                }}
              >
                Total Drinks
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.sum}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#4b5563",
                  marginBottom: "2px",
                }}
              >
                Average Per Day
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.averagePerDay.toFixed(2)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#4b5563",
                  marginBottom: "2px",
                }}
              >
                Drinkless Days
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.drinklessDays}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#4b5563",
                  marginBottom: "2px",
                }}
              >
                Drinking Days
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                {stats.totalDays - stats.drinklessDays}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setWrappedPage(0);
          }}
          style={{
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#6d28d9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#7c3aed";
          }}
        >
          Boozeify Wrapped
        </button>
      </div>

      {/* Calendar Months */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(2, auto)",
          gap: "16px",
        }}
      >
        {months.map((month, index) => renderMonth(month, index))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: "fixed",
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y}px`,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#1f2937",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            whiteSpace: "pre-line",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: "5px",
          }}
        >
          {hoveredDay.text}
          <div
            style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid #1f2937",
            }}
          />
        </div>
      )}

      {/* Boozeify Wrapped Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "800px",
              height: "90%",
              maxHeight: "600px",
              backgroundColor:
                wrappedPage === 0
                  ? "#8b5cf6"
                  : wrappedPage === 1
                  ? "#ec4899"
                  : wrappedPage === 2
                  ? "#f59e0b"
                  : wrappedPage === 3
                  ? "#10b981"
                  : "#06b6d4",
              borderRadius: "20px",
              padding: "60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              color: "white",
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            {wrappedPage === 0 && (
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "48px",
                    fontWeight: "bold",
                    marginBottom: "40px",
                  }}
                >
                  Your 2025 Wrapped
                </h1>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "30px",
                    marginTop: "40px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                      Total Drinks
                    </div>
                    <div style={{ fontSize: "64px", fontWeight: "bold" }}>
                      {stats.sum}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                      Average Per Day
                    </div>
                    <div style={{ fontSize: "64px", fontWeight: "bold" }}>
                      {stats.averagePerDay.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                      Drinkless Days
                    </div>
                    <div style={{ fontSize: "64px", fontWeight: "bold" }}>
                      {stats.drinklessDays}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                      Drinking Days
                    </div>
                    <div style={{ fontSize: "64px", fontWeight: "bold" }}>
                      {stats.totalDays - stats.drinklessDays}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {wrappedPage === 1 && (
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    marginBottom: "30px",
                  }}
                >
                  Your Peak & Valley
                </h1>
                {maxMonthIndex !== -1 && (
                  <div style={{ marginBottom: "30px" }}>
                    <div style={{ fontSize: "18px", marginBottom: "15px" }}>
                      Highest Month
                    </div>
                    <div style={{ fontSize: "48px", fontWeight: "bold" }}>
                      {monthNames[months[maxMonthIndex].month]}{" "}
                      {months[maxMonthIndex].year}
                    </div>
                    <div style={{ fontSize: "24px", marginTop: "8px" }}>
                      {monthlyTotals[maxMonthIndex]} drinks
                    </div>
                  </div>
                )}
                {minMonthIndex !== -1 && (
                  <div style={{ marginBottom: "30px" }}>
                    <div style={{ fontSize: "18px", marginBottom: "15px" }}>
                      Lowest Month
                    </div>
                    <div style={{ fontSize: "48px", fontWeight: "bold" }}>
                      {monthNames[months[minMonthIndex].month]}{" "}
                      {months[minMonthIndex].year}
                    </div>
                    <div style={{ fontSize: "24px", marginTop: "8px" }}>
                      {monthlyTotals[minMonthIndex]} drinks
                    </div>
                  </div>
                )}
                {maxMonthIndex !== -1 && (
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginTop: "30px",
                      fontStyle: "italic",
                    }}
                  >
                    That's so {getAstrologicalSign(months[maxMonthIndex].month)}{" "}
                    of you
                  </div>
                )}
              </div>
            )}

            {wrappedPage === 2 && (
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    marginBottom: "30px",
                  }}
                >
                  Your Peak Day
                </h1>
                {maxDrinkDay && (
                  <>
                    <div style={{ marginBottom: "30px" }}>
                      <div style={{ fontSize: "18px", marginBottom: "15px" }}>
                        Highest Drinking Day
                      </div>
                      <div style={{ fontSize: "48px", fontWeight: "bold" }}>
                        {formatDate(maxDrinkDay.date)}
                      </div>
                      <div style={{ fontSize: "36px", marginTop: "15px" }}>
                        {maxDrinkDay.drinks} drink
                        {maxDrinkDay.drinks !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginTop: "30px",
                        fontStyle: "italic",
                      }}
                    >
                      {getSeasonMessage(getSeason(maxDrinkDay.date))}
                    </div>
                  </>
                )}
              </div>
            )}

            {wrappedPage === 3 && (
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    marginBottom: "30px",
                  }}
                >
                  Your Dry Streak
                </h1>
                <div style={{ marginBottom: "30px" }}>
                  <div style={{ fontSize: "24px", marginBottom: "20px" }}>
                    Your record was {longestStreak} day
                    {longestStreak !== 1 ? "s" : ""} without a drink this year
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginTop: "30px",
                      fontStyle: "italic",
                    }}
                  >
                    {getStreakMessage(longestStreak)}
                  </div>
                </div>
              </div>
            )}

            {wrappedPage === 4 && (
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    marginBottom: "30px",
                  }}
                >
                  Holiday Cheers
                </h1>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    marginBottom: "30px",
                    fontSize: "18px",
                  }}
                >
                  {holidayDrinks.map((holiday) => (
                    <div key={holiday.name}>
                      {holiday.name}: {holiday.drinks} drink
                      {holiday.drinks !== 1 ? "s" : ""}
                    </div>
                  ))}
                </div>
                {topHoliday && topHoliday.drinks > 0 && (
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginTop: "30px",
                      fontStyle: "italic",
                    }}
                  >
                    {getHolidayMessage(topHoliday.name)}
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "40px",
                display: "flex",
                gap: "20px",
              }}
            >
              <button
                onClick={() => setWrappedPage(0)}
                disabled={wrappedPage === 0}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    wrappedPage === 0
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.1)",
                  border: "2px solid white",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: wrappedPage === 0 ? "default" : "pointer",
                  opacity: wrappedPage === 0 ? 1 : 0.7,
                }}
              >
                1
              </button>
              <button
                onClick={() => setWrappedPage(1)}
                disabled={wrappedPage === 1}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    wrappedPage === 1
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.1)",
                  border: "2px solid white",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: wrappedPage === 1 ? "default" : "pointer",
                  opacity: wrappedPage === 1 ? 1 : 0.7,
                }}
              >
                2
              </button>
              <button
                onClick={() => setWrappedPage(2)}
                disabled={wrappedPage === 2}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    wrappedPage === 2
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.1)",
                  border: "2px solid white",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: wrappedPage === 2 ? "default" : "pointer",
                  opacity: wrappedPage === 2 ? 1 : 0.7,
                }}
              >
                3
              </button>
              <button
                onClick={() => setWrappedPage(3)}
                disabled={wrappedPage === 3}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    wrappedPage === 3
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.1)",
                  border: "2px solid white",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: wrappedPage === 3 ? "default" : "pointer",
                  opacity: wrappedPage === 3 ? 1 : 0.7,
                }}
              >
                4
              </button>
              <button
                onClick={() => setWrappedPage(4)}
                disabled={wrappedPage === 4}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    wrappedPage === 4
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.1)",
                  border: "2px solid white",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: wrappedPage === 4 ? "default" : "pointer",
                  opacity: wrappedPage === 4 ? 1 : 0.7,
                }}
              >
                5
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrinkingCalendar;
