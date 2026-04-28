try:
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False


def generate_ml_insights(employee_data, total_tasks, completed_tasks, delayed_count):
    if not ML_AVAILABLE or not employee_data:
        raise Exception("ML libraries not available or missing data")

    df = pd.DataFrame(employee_data)

    if len(df) < 10:
        synth_data = []
        for index, row in df.iterrows():
            for _ in range(3):
                synth_data.append({
                    'username': row['username'],
                    'pending': max(0, row['pending'] + np.random.randint(-2, 3)),
                    'completed': max(0, row['completed'] + np.random.randint(-1, 4)),
                    'attendance_rate': max(50, min(100, row['attendance_rate'] + np.random.randint(-10, 5)))
                })
        df = pd.concat([df, pd.DataFrame(synth_data)], ignore_index=True)

    df['efficiency'] = df['completed'] / (df['pending'] + 1)

    def calc_risk(row):
        score = (row['pending'] * 2) - (row['efficiency'] * 5)
        if score > 10: return 2
        elif score > 4: return 1
        return 0

    df['risk_target'] = df.apply(calc_risk, axis=1)

    X = df[['pending', 'completed', 'attendance_rate', 'efficiency']]
    y_risk = df['risk_target']

    rf_risk = RandomForestClassifier(n_estimators=20, max_depth=3, random_state=42)
    rf_risk.fit(X, y_risk)

    y_delay = (df['pending'] * 1.5) / (df['completed'] + 1)
    rf_delay = RandomForestRegressor(n_estimators=20, max_depth=3, random_state=42)
    rf_delay.fit(X, y_delay)

    mean_state = pd.DataFrame([{
        'pending': df['pending'].mean(),
        'completed': df['completed'].mean(),
        'attendance_rate': df['attendance_rate'].mean(),
        'efficiency': df['efficiency'].mean()
    }])

    pred_risk = rf_risk.predict(mean_state)[0]
    pred_delay = rf_delay.predict(mean_state)[0]

    risk_label = "LOW"
    if pred_risk == 2: risk_label = "HIGH"
    elif pred_risk == 1: risk_label = "MEDIUM"

    confidence = int(np.clip(100 - (df['pending'].std() * 2), 65, 98))

    delay_str = "No delay expected"
    if pred_delay > 4: delay_str = "High delays expected"
    elif pred_delay > 2: delay_str = "Some delays expected ⚠️"

    base_employees = pd.DataFrame(employee_data)
    if not base_employees.empty:
        base_employees['eff_score'] = base_employees['completed'] / (base_employees['pending'] + 1)
        best_emp = base_employees.sort_values(by='eff_score', ascending=False).iloc[0]['username']
    else:
        best_emp = "N/A"

    return {
        "risk": risk_label,
        "predicted_delay": delay_str,
        "best_employee": best_emp,
        "confidence": confidence
    }
