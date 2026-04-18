import pandas as pd
import numpy as np

try:
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
except ImportError:
    RandomForestClassifier = None
    RandomForestRegressor = None

def generate_ml_insights(employee_data, total_tasks, completed_tasks, delayed_count):
    """
    Train a Random Forest model dynamically on the fly to predict risk and delays.
    Generates synthetic variance if the dataset is too small to avoid sklearn crash.
    """
    if not RandomForestClassifier or not employee_data:
        raise Exception("Sklearn not available or missing data")

    # Prepare historical / empirical dataframe
    df = pd.DataFrame(employee_data)
    
    # Needs columns: username, pending, completed, attendance_rate
    # If we have < 10 rows, inject synthetic historical variance
    if len(df) < 10:
        synth_data = []
        for index, row in df.iterrows():
            for _ in range(3):  # create 3 mutations per node
                synth_data.append({
                    'username': row['username'],
                    'pending': max(0, row['pending'] + np.random.randint(-2, 3)),
                    'completed': max(0, row['completed'] + np.random.randint(-1, 4)),
                    'attendance_rate': max(50, min(100, row['attendance_rate'] + np.random.randint(-10, 5)))
                })
        df = pd.concat([df, pd.DataFrame(synth_data)], ignore_index=True)

    # Compute Feature Vectors
    # efficiency = completed / (pending + 1)
    df['efficiency'] = df['completed'] / (df['pending'] + 1)
    
    # Generative Target 1: Risk (0: LOW, 1: MEDIUM, 2: HIGH)
    def calc_risk(row):
        score = (row['pending'] * 2) - (row['efficiency'] * 5)
        if score > 10: return 2
        elif score > 4: return 1
        return 0
        
    df['risk_target'] = df.apply(calc_risk, axis=1)

    X = df[['pending', 'completed', 'attendance_rate', 'efficiency']]
    y_risk = df['risk_target']

    # 1. Train Random Forest Classifier for System Risk
    rf_risk = RandomForestClassifier(n_estimators=20, max_depth=3, random_state=42)
    rf_risk.fit(X, y_risk)
    
    # 2. Train Random Forest Regressor for Delay Probability
    y_delay = (df['pending'] * 1.5) / (df['completed'] + 1)
    rf_delay = RandomForestRegressor(n_estimators=20, max_depth=3, random_state=42)
    rf_delay.fit(X, y_delay)

    # Predict globally based on mean system state
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
    
    # Score confidence via simple density validation
    confidence = int(np.clip(100 - (df['pending'].std() * 2), 65, 98))

    delay_str = "No delay expected"
    if pred_delay > 4: delay_str = "High delays expected"
    elif pred_delay > 2: delay_str = "Some delays expected \u26A0\uFE0F"

    # Best Employee via Efficiency mapping
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
