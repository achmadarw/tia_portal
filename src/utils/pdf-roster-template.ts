interface RosterData {
    monthStr: string;
    daysInMonth: number;
    dayNames: string[];
    users: {
        name: string;
        shifts: { day: number; shiftCode: string; isOff: boolean }[];
    }[];
}

export function generateRosterPDFTemplate(data: RosterData): string {
    const { monthStr, daysInMonth, dayNames, users } = data;

    // Modern color palette based on shift type
    const shiftColors: Record<string, { bg: string; text: string }> = {
        '1': { bg: '#FFF9C4', text: '#F57F17' }, // Pagi - Yellow
        '2': { bg: '#B2EBF2', text: '#00838F' }, // Siang - Cyan
        '3': { bg: '#C8E6C9', text: '#2E7D32' }, // Malam - Green
        O: { bg: '#E0E0E0', text: '#616161' }, // OFF - Gray
    };

    // Build calendar grid
    let calendarHTML = '';

    users.forEach((user) => {
        calendarHTML += `
        <div class="user-row">
            <div class="user-name">${user.name}</div>
            <div class="shifts-container">`;

        user.shifts.forEach((shift) => {
            const colorScheme = shiftColors[shift.shiftCode] || {
                bg: '#FFFFFF',
                text: '#000000',
            };
            calendarHTML += `
                <div class="shift-box" style="background-color: ${
                    colorScheme.bg
                }; color: ${colorScheme.text};">
                    ${shift.shiftCode || ''}
                </div>`;
        });

        calendarHTML += `
            </div>
        </div>`;
    });

    // Build header with dates and day names
    let headerDates = '';
    let headerDays = '';

    for (let day = 1; day <= daysInMonth; day++) {
        headerDates += `<div class="date-cell">${day}</div>`;
    }

    dayNames.forEach((dayName) => {
        headerDays += `<div class="day-name-cell">${dayName}</div>`;
    });

    // Complete HTML template
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: A4 landscape;
            margin: 8mm;
        }
        
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 12px;
            background: #fafafa;
            color: #1a1a1a;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2196F3;
        }
        
        .header h3 {
            margin: 1px 0;
            font-size: 10pt;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
        }
        
        .header h2 {
            margin: 10px 0 0 0;
            font-size: 16pt;
            font-weight: 700;
            color: #1976D2;
            letter-spacing: 1.2px;
        }
        
        .calendar-container {
            background: white;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header-grid {
            display: grid;
            grid-template-columns: 120px repeat(${daysInMonth}, 1fr);
            gap: 3px;
            margin-bottom: 8px;
            align-items: center;
        }
        
        .header-label {
            font-weight: 700;
            font-size: 9pt;
            background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
            color: white;
            border-radius: 4px;
            height: 32px;
            padding: 10px 4px;
            text-align: center;
        }
        
        .date-cell, .day-name-cell {
            font-size: 8pt;
            font-weight: 600;
            background: #E8F5E9;
            border-radius: 3px;
            height: 28px;
            padding: 9px 2px;
            text-align: center;
        }
        
        .date-cell {
            color: #2E7D32;
        }
        
        .day-name-cell {
            color: #1B5E20;
            font-size: 7pt;
        }
        
        .user-row {
            display: grid;
            grid-template-columns: 120px repeat(${daysInMonth}, 1fr);
            gap: 3px;
            margin-bottom: 4px;
            align-items: center;
        }
        
        .user-name {
            font-weight: 700;
            font-size: 9pt;
            background: #F5F5F5;
            border-radius: 4px;
            border-left: 4px solid #2196F3;
            height: 32px;
            padding: 10px 8px;
            text-align: center;
        }
        
        .shifts-container {
            display: contents;
        }
        
        .shift-box {
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 10pt;
            border-radius: 4px;
            border: 1.5px solid rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        }
        
        .shift-box:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .legend {
            margin-top: 15px;
            padding: 10px;
            background: white;
            border-radius: 6px;
            display: flex;
            justify-content: center;
            gap: 20px;
            font-size: 8pt;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
        }
        
        .legend-box {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            border: 1.5px solid rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>KABUPATEN BOGOR</h3>
        <h3>KECAMATAN CIBINONG KELURAHAN KARADENAN</h3>
        <h3>PAGUYUBAN THE ICON ACROPOLIS RT010/RW018</h3>
        <h2>${monthStr}</h2>
    </div>
    
    <div class="calendar-container">
        <div class="header-grid">
            <div class="header-label">Personnel</div>
            ${headerDates}
        </div>
        <div class="header-grid" style="margin-bottom: 12px;">
            <div class="header-label">Day</div>
            ${headerDays}
        </div>
        
        ${calendarHTML}
    </div>
    
    <div class="legend">
        <div class="legend-item">
            <div class="legend-box" style="background: #FFF9C4; border-color: #F57F17;"></div>
            <span style="color: #F57F17;">Pagi (1)</span>
        </div>
        <div class="legend-item">
            <div class="legend-box" style="background: #B2EBF2; border-color: #00838F;"></div>
            <span style="color: #00838F;">Siang (2)</span>
        </div>
        <div class="legend-item">
            <div class="legend-box" style="background: #C8E6C9; border-color: #2E7D32;"></div>
            <span style="color: #2E7D32;">Malam (3)</span>
        </div>
        <div class="legend-item">
            <div class="legend-box" style="background: #E0E0E0; border-color: #616161;"></div>
            <span style="color: #616161;">OFF (O)</span>
        </div>
    </div>
</body>
</html>`;
}
