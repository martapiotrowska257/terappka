from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
def get_health():
    return jsonify({'health': 'ok'}), 200

